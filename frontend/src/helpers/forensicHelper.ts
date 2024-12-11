import { Bid, Item } from "../api";
import { max, mean, median, mode, standardDeviation } from "simple-statistics";
import { User } from "../models/User";

export interface Statistic {
  max: number,
  mean: number,
  median: number,
  mode: number,
  standardDerivation: number,
}

export interface ItemStatistics {
  total: number,
  frozenItems: number,
  itemCountByState: {
    active: number,
    archived: number,
    completed: number,
    failed: number,
    inactive: number,
  },
  mostBidItem?: Item,
  itemBidCount: Statistic,
  itemInitialPrice: Statistic,
  itemSoldPrice: Statistic,
  itemAuctionLength: Statistic,
}

export interface UserStatistics {
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

export function itemStatistics(items: Item[], bids: Bid[]): ItemStatistics {
  const bidRecord: Record<string, Bid> = {};
  bids.forEach(b => {
    bidRecord[b.id] = b;
  });

  let total = items.length;
  let mostBidItem = items.sort((a, b) => (b.pastBidIds?.length || 0) - (a.pastBidIds?.length || 0)).at(0);

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
    mostBidItem,
    itemBidCount: createStatistics(itemBidCounts),
    itemInitialPrice: createStatistics(itemInitialPrices),
    itemSoldPrice: createStatistics(itemSoldPrices),
    itemAuctionLength: createStatistics(itemAuctionLengths),
  }
}

export function userStatistics(user: User[]): UserStatistics {
  const filtUsers = user.filter(e => e.role !== "admin");

  const total = filtUsers.length;
  const sellers = filtUsers.filter(e => e.userType === "seller").length;
  const buyers = filtUsers.filter(e => e.userType === "buyer").length;

  return {
    total,
    sellers,
    buyers,
  };
}
