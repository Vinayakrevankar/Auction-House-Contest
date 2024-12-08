export interface LengthOfAuction {
  day: number,
  hour: number,
  min: number,
  sec: number,
}

export function la2ts(la: LengthOfAuction) {
  return (la.day * 24 * 60 * 60 * 1000) + (la.hour * 60 * 60 * 1000) + (la.min * 60 * 1000) + (la.sec * 1000);
}

