import React, { useState } from 'react';
import styles from './index.less';
import Table from '../TTable/index';

function TableCon(props) {
  const [height, setHeight] = useState(400);
  const [data, setData] = useState(genData(1));

  /**
   *  column 的 config
   *  title,dataIndex,width,position(left, center, right)
   */
  const columns = [
    {
      title: '成本中心',
      dataIndex: 'a',
      position: 'left',
      // fixed:'left',//如果为'right'则会在右边固定
      width: 250
    },
    {
      title: '预算项目',
      dataIndex: 'b',
      position: 'left',
      // fixed:'right',//设置预算项目列滚动
      width: 150
    },
    {
      title: '批复金额',
      dataIndex: 'c',
      width: 150,
      headerRender(txt) {
        return <div>{txt}</div>;
      },
      render(money) {
        return <div className={'text-right'}>{money}</div>;
      }
    },
    {
      title: '剩余第二',
      dataIndex: 'e',
      position: 'right',
      width: 150,
      render(money) {
        return <div className={'text-right'}>{money}</div>;
      }
    },
    {
      title: '剩余可用预算',
      dataIndex: 'd',
      position: 'right',
      width: 250,
      render(money) {
        return <div className={'text-right'}>{money}</div>;
      }
    }
  ];
  // const data = genData();
  function genData(init) {
    const tempData = init ? [] : data;
    let i = 10;
    while (i--) {
      tempData.push({ a: `a${i}`, b: `b${i}`, c: `c${i}`, d: `d${i}`, e: `e${i}` });
    }
    return tempData;
  }
  /* 上拉刷新 */
  const pullRefresh = () => {
    Promise.resolve(
      (() => {
        return setData(genData(1));
      })()
    );
  };

  const loadMore = () => {
    Promise.resolve(
      (() => {
        return setData(genData());
      })()
    );
  };
  const [view, setView] = useState(0);
  
  /* 切换查看 */
  const changeView = () => {
    const config = {
      0: 1,
      1: 2,
      2: 0
    };
    setView(config[view]);
  };
  return (
    <div className={styles.container}>
      <h1 onClick={() => {changeView()}}>sfsdfsdfs</h1>
      <Table
        columns={columns}
        dataSource={data}
        tableLayout={'fixed'}
        tableHeight={height}
        pullRefresh={pullRefresh}
        loadMore={loadMore}
        view={view}
      />
    </div>
  );
}

export default TableCon;
