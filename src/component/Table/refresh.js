/* 处理  刷新 和 加载的事件 */
export const pullRefresh = (props, setLoading) => {
  return () => {
    setTimeout(async () => {
      const { pullRefresh } = props;
      if (pullRefresh && (pullRefresh instanceof Function)) {
        try {
          await pullRefresh();
        } catch (error) {
          console.log('error', error);
        }
      }
      setLoading(false)
    }, 300)
  }
}
export const loadMore = (props, setLoading) => {
  return () => {
    setTimeout(async () => {
      const { loadMore } = props;
      if (loadMore && (loadMore instanceof Function)) {
        try {
          const res = await loadMore();
        } catch (error) {
          console.log('error', error);
        }
      }
      setLoading(false);
    }, 300)
  }
}
