import moment from "moment";
import { Item } from "../api";

export type ItemSimple = {
  id: string; // Use a better unique ID in production
  name: string;
  description: string;
  initPrice: number;
  itemState: string;
  isFrozen: boolean,
  lengthOfAuction: number;
  images: string[]; // For simplicity
  isAvailableToBuy: boolean;
  currentBidId: string;
};

export function itemFromSimple(v: ItemSimple, userId: string): Item {
  const sdate = new Date();
  const edate = new Date(sdate.getTime());
  edate.setDate(edate.getDate() + v.lengthOfAuction);
  const item: Item = {
    isAvailableToBuy: false,
    id: v.id,
    name: v.name,
    description: v.description,
    initPrice: v.initPrice,
    startDate: moment(sdate).toISOString(),
    endDate: moment(edate).toISOString(),
    lengthOfAuction: v.lengthOfAuction,
    itemState: 'inactive',
    isFrozen: false,
    images: v.images,
    sellerId: userId,
    currentBidId: v.currentBidId ?? '',
    createAt: sdate.getTime(),
  };
  return item;
}

export function itemToSimple(v: Item): ItemSimple {
  return {
    isAvailableToBuy: v.isAvailableToBuy ?? false,
    id: v.id,
    name: v.name,
    description: v.description,
    initPrice: v.initPrice,
    itemState: v.itemState,
    isFrozen: v.isFrozen,
    currentBidId: v.currentBidId ?? '',
    lengthOfAuction: v.lengthOfAuction,
    images: v.images || [],
  };
}
