export const marketEndpoints = {
    latest: '/stocks/{symbol}/bars/latest',
    bars: '/stocks/{symbol}/bars&timeframe={timeframe}&start={start}&end={end}&limit=1000&adjustment=raw&feed=sip&sort=asc',
};
