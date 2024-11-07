#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { exit } from "node:process";
import dayjs from "dayjs";
import objectSupport from "dayjs/plugin/objectSupport.js";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import Stripe from "stripe";
import { isMember } from "./src/memberStatus.mjs";

dayjs.extend(objectSupport);
const today = dayjs();

const CSVoptions = {
  columns: true,
  skipEmptyLines: true,
  skipRecordsWithError: true,
};

const env = {
  api: process.env.CONTENTFUL_API,
  environment: process.env.CONTENTFUL_ENVIRONMENT,
  space: process.env.CONTENTFUL_SPACE,
  token: {
    management: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    delivery: process.env.CONTENTFUL_DELIVERY_TOKEN,
    preview: process.env.CONTENTFUL_PREVIEW_TOKEN,
  },
};

const values = [...Object.entries(env), ...Object.entries(env.token)];
values.forEach(([key, value]) => {
  if (!value) throw TypeError(`contentful ${key} cannot be empty [${value}]`);
});

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  // we're in a production environment
  console.log("stripe production environment");
  const secret = process.env.STRIPE_SECRET_KEY;

  stripe = new Stripe(secret);
}

const listSubscriptions = async () => {
  const subscriptions = await stripe.subscriptions
    .list({ status: "active", expand: ["data.customer"] })
    .autoPagingToArray({ limit: 10000 });
  return subscriptions;
};

// api endpoint is for grpahql interface only
// from can be 'delivery' or 'preview'

const cmsFetch = async (query, from = "delivery") => {
  if (!query) throw TypeError(`contentful fetch query cannot be empty`);

  const response = await fetch(env.api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.token[from]}`,
    },
    body: JSON.stringify({ query }),
  });

  const json = await response.json();
  const content = json.data;
  return content;
};

const assetsByTitle = async (title) => {
  const query = `
  {
    assetCollection(where: {title: "${title}"}) {
      items {
        title
        description
        url
        sys {
          publishedAt
        }
      }
    }
  }
`;
  try {
    const assets = await cmsFetch(query);
    return assets.assetCollection.items;
  } catch (error) {
    throw Error(`could not fetch assetsByTitle because [${error.message}]`);
  }
};

const maxAge = (type) => {
  if (type.startsWith("12 - 15")) return 15;
  if (type.startsWith("16 - 18")) return 18;
  if (type.startsWith("19-25")) return 25;
  if (type.startsWith("5 - 11")) return 11;
  if (type.startsWith("Under 5s")) return 5;
  return Number.MAX_SAFE_INTEGER;
};

const upgradeFrom = (type) => {
  if (type.startsWith("12 - 15")) return "16 - 18 yrs Annual";
  if (type.startsWith("16 - 18")) return "19-25 yrs Annual";
  if (type.startsWith("19-25 yrs Annual")) return "Standard Annual";
  if (type.startsWith("19-25 yrs DD")) return "Standard DD";
  if (type.startsWith("5 - 11")) return "12 - 15 yrs Annual";
  if (type.startsWith("Under 5s")) return "5 - 11 yrs Annual";
  return "";
};

// const isMember = (member) => {
//   const status = member.Status.toLowerCase().trim()
//   if (status === 'live') return true
//   if (status === 'complete' || status === 'paid in full') {
//     const card = member['Card No']
//     const ashref = member.AshRef
//     let lastPayDate = member['Last Pay Date'].trim().split(' ')[0]
//     let [day, month, year] = lastPayDate.split('/')
//     const dLastPayDate = dayjs({ year: +year, month: +month - 1, day: +day })
//     const aMonthAgo = today.subtract(1, 'month')
//     if (card && ashref && dLastPayDate.isAfter(aMonthAgo, 'day')) {
//       return true
//     }
//   }
//   return false
// }

const ashbourne = async () => {
  try {
    // fetch the 'ashbourne' asset from contentful
    const assets = await assetsByTitle("ashbourne.csv");

    // if the asset is not there or, is ambiguous it is an error
    if (assets.length === 0) throw Error(`ashbourne asset is not present`);
    if (assets.length !== 1) throw Error(`expected single ashbourne asset`);

    const { title, url, sys } = assets[0];
    const { publishedAt } = sys;

    console.log(`${title}, ${dayjs(publishedAt).format()}`);

    let csv = await fetch(url);
    csv = await csv.text();
    csv = parse(csv, CSVoptions);
    csv = csv
      .filter((member) => member.Status.trim() !== "Expired")
      .filter((member) => {
        const status = member.Status.trim();
        if (status !== "Complete") return true;
        const card = member["Card No"].trim();
        if (card.length > 0) return true;
        return false;
      })
      .filter((member) => {
        const status = member.Status.trim();
        if (status !== "Paid in Full") return true;
        const card = member["Card No"].trim();
        if (card.length > 0) return true;
        return false;
      })
      .map((member) => {
        const status = member.Status;
        const ref = member.AshRef;

        const name = `${
          member[
            "First Name"
          ].trim()
        } ${member.Surname.trim()}`.trim();
        const known = member.KnownAs;

        const dob = member.DOB.trim().split(" ")[0];
        let [day, month, year] = dob.split("/");
        let dDob = dayjs({ year: +year, month: +month - 1, day: +day });
        let age = today.diff(dDob, "years");

        const adob = member.AdditionalDOB.trim().split(" ")[0];
        if (adob) {
          let [day, month, year] = adob.split("/");
          dDob = dayjs({ year: +year, month: +month - 1, day: +day });
          age = today.diff(dDob, "years");
        }

        let expires = ref
          ? member["Last Pay Date"].trim().split(" ")[0]
          : member["Expire Date"].trim().split(" ")[0];
        let [eday, emonth, eyear] = expires.split("/");
        let dExpires = dayjs({
          year: +eyear,
          month: +emonth - 1,
          day: +eday,
        });
        const eage = dExpires.diff(dDob, "years");

        let renewal = expires ? dExpires.format("MMMM") : "renewal-unknown";

        // Complete and Non-Zero Card No with expiry in the past should be marked as expired
        if (!isMember(member)) {
          renewal = "should-have-expired";
        }

        return {
          id: member["Member No"],
          card: member["Card No"],
          ref,
          name,
          known,
          dob,
          adob,
          age,
          status,
          type: member["Mem Type"],
          expires,
          eage,
          renewal,
          mobile: member.Mobile.replace(/' '/g, ""),
          email: member.Email.trim(),
        };
      })
      .map((member) => {
        const { type, age, eage } = member;
        const maxAllowedAge = maxAge(type);
        let change = maxAllowedAge < eage ? "yes" : "none";
        if (eage > 100) change = "invalid-dob";
        if (eage < 0) change = "invalid-expires-date";

        const upgrade = change === "yes" ? upgradeFrom(type) : "";

        return { ...member, change, upgrade };
      });

    let subscriptions = await listSubscriptions();
    writeFileSync("subscriptions.json", JSON.stringify(subscriptions, null, 2));

    subscriptions = subscriptions.map((subscription) => {
      const { start_date, current_period_start, current_period_end } =
        subscription;

      const display = "DD/MM/YYYY HH:mm";
      const original = dayjs.unix(start_date).format(display);
      const start = dayjs.unix(current_period_start).format(display);
      const end = dayjs.unix(current_period_end).format(display);
      const renews = dayjs
        .unix(current_period_end)
        .add(1, "day")
        .format(display);

      return {
        sid: subscription.id,
        sname: subscription.customer.name,
        semail: subscription.customer.email,
        smobile: `...${subscription.customer.phone}`,
        soriginal: original,
        sstart: start,
        send: end,
        srenews: renews,
        // address: subscription.customer.address,
        // metadata: subscription.customer.metadata,
        samount: subscription.plan.amount / 100,
        sinterval: subscription.plan.interval,
        stype: subscription.plan.nickname,
      };
    });

    writeFileSync(
      "subscriptions-pared-down.json",
      JSON.stringify(subscriptions, null, 2),
    );

    csv = csv.map((member) => {
      const stripe = {
        sid: "",
        sname: "",
        semail: "",
        smobile: "",
        soriginal: "",
        sstart: "",
        send: "",
        srenews: "",
        samount: "",
        sinterval: "",
        stype: "",
      };

      const found = subscriptions.find(
        (subscriber) => member.email === subscriber.semail,
      );

      if (found) {
        Object.assign(stripe, found);
        found.used = true;
      }

      return {
        ...member,
        ...stripe,
      };
    });

    const notFound = subscriptions
      .filter((subscriber) => !subscriber.used)
      .map((subscriber) => {
        const ashbourne = {
          id: "",
          card: "",
          ref: "",
          name: "",
          known: "",
          dob: "",
          adob: "",
          age: "",
          status: "",
          type: "",
          expires: "",
          eage: "",
          renewal: "",
          mobile: "",
          email: "",
          change: "",
          upgrade: "",
        };
        return { ...ashbourne, ...subscriber };
      });

    csv = csv.concat(notFound);
    writeFileSync("notfound.json", JSON.stringify(notFound, null, 2));
    writeFileSync("renewals.json", JSON.stringify(csv, null, 2));
    writeFileSync(
      "renewals.csv",
      stringify(csv, { header: true, quoted: true }),
    );

    // otherwise we're all up to date
    console.log(`ashbourne renewals done`);
  } catch (error) {
    console.error(`ashbourne renewals failed [${error.message}]`);
    exit(1);
  }
};

ashbourne();
