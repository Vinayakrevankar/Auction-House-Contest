import { Bid, Item } from "../api";
import { max, mean, median, mode, standardDeviation } from "simple-statistics";
import { User } from "../models/User";

interface Statistic {
  max: number,
  mean: number,
  median: number,
  mode: number,
  standardDerivation: number,
}

interface ItemStatistics {
  total: number,
  frozenItems: number,
  itemCountByState: {
    active: number,
    archived: number,
    completed: number,
    failed: number,
    inactive: number,
  },
  itemBidCount: Statistic,
  itemInitialPrice: Statistic,
  itemSoldPrice: Statistic,
  itemAuctionLength: Statistic,
}

interface UserStatistics {
  total: number,
  sellers: number,
  buyers: number,
}

function createStatistics(x: number[]): Statistic {
  return {
    max: max(x),
    mean: mean(x),
    median: median(x),
    mode: mode(x),
    standardDerivation: standardDeviation(x),
  }
}

function camelToUnderscore(key: string) {
  var result = key.replace(/([A-Z])/g, " $1");
  return result.split(' ').join('_').toLowerCase();
}

function itemStatistics(items: Item[], bids: Bid[]): ItemStatistics {
  const bidRecord: Record<string, Bid> = {};
  bids.forEach(b => {
    bidRecord[b.id] = b;
  });

  let total = items.length;

  const frozenItems = items.reduce((acc, e) => e.isFrozen ? acc + 1 : acc, 0);

  const itemBidCounts = items.reduce((acc: number[], e) => e.pastBidIds ? acc.concat(e.pastBidIds.length) : acc, []);
  const itemInitialPrices = items.map(e => e.initPrice);
  const itemSoldPrices = items.reduce((acc: number[], e) => e.soldBidId ? acc.concat(bidRecord[e.soldBidId].bidAmount) : acc, []);
  const itemAuctionLengths = items.map(e => e.lengthOfAuction);

  return {
    total,
    frozenItems,
    itemCountByState: {
      active: items.reduce((acc, e) => e.itemState === "active" ? acc + 1 : acc, 0),
      archived: items.reduce((acc, e) => e.itemState === "archived" ? acc + 1 : acc, 0),
      completed: items.reduce((acc, e) => e.itemState === "completed" ? acc + 1 : acc, 0),
      failed: items.reduce((acc, e) => e.itemState === "failed" ? acc + 1 : acc, 0),
      inactive: items.reduce((acc, e) => e.itemState === "inactive" ? acc + 1 : acc, 0),
    },
    itemBidCount: createStatistics(itemBidCounts),
    itemInitialPrice: createStatistics(itemInitialPrices),
    itemSoldPrice: createStatistics(itemSoldPrices),
    itemAuctionLength: createStatistics(itemAuctionLengths),
  }
}

function userStatistics(users: User[]): UserStatistics {
  const filtUsers = users.filter(e => e.role !== "admin");

  const total = filtUsers.length;
  const sellers = filtUsers.filter(e => e.userType === "seller").length;
  const buyers = filtUsers.filter(e => e.userType === "buyer").length;

  return {
    total,
    sellers,
    buyers,
  };
}

function flattenObject(ob: Record<string, any>): Record<string, any> {
  let toReturn: Record<string, any> = {};

  for (let i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if ((typeof ob[i]) == 'object' && ob[i] !== null) {
      let flatObject = flattenObject(ob[i]);
      for (let x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[camelToUnderscore(i) + '.' + camelToUnderscore(x)] = flatObject[x];
      }
    } else {
      toReturn[camelToUnderscore(i)] = ob[i];
    }
  }
  return toReturn;
}

export function createForensicsReport(users: User[], items: Item[], bids: Bid[]) {
  const ustat = userStatistics(users);
  const istat = itemStatistics(items, bids);
  return flattenObject({
    "user": ustat,
    "item": istat,
  });
}
