export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export const compactViews = (n: number) =>
  n >= 100_000_000
    ? `${(n / 100_000_000).toFixed(1)}억회`
    : n >= 10_000
      ? `${Math.floor(n / 10_000).toLocaleString("ko-KR")}만회`
      : `${n.toLocaleString("ko-KR")}회`;
