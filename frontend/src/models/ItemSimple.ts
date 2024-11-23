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
};

export function itemFromSimple(v: ItemSimple, userId: string): Item {
  const sdate = new Date();
  const edate = new Date(sdate.getTime());
  edate.setDate(edate.getDate() + v.lengthOfAuction);
  const item: Item = {
    id: v.id,
    name: v.name,
    description: v.description,
    initPrice: v.initPrice,
    startDate: sdate.toISOString(),
    endDate: edate.toISOString(),
    lengthOfAuction: v.lengthOfAuction,
    itemState: 'inactive',
    isFrozen: false,
    images: v.images,
    sellerId: userId,
    createAt: sdate.getTime(),
  };
  return item;
}

export function itemToSimple(v: Item): ItemSimple {
  return {
    id: v.id,
    name: v.name,
    description: v.description,
    initPrice: v.initPrice,
    itemState: v.itemState,
    isFrozen: v.isFrozen,
    lengthOfAuction: v.lengthOfAuction,
    images: v.images || [], 
  };
}