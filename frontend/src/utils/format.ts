export const formatInches = (inches: number) => {
  if (inches < 9 && inches > 8.5) return 8.5;
  return Math.floor(inches);
};

export const formatPrice = (cents: number) => {
  return Number(cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};
