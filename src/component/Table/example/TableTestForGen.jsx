import React, { useState } from 'react'
import './index.less'
import Table from '../Table'

function TableCon(props) {
  const [height, setHeight] = useState(400);
  const [data, setData] = useState(genData(1))

  const columns = [
    {
      title: "成本中心",
      dataIndex: 'a',
      fixed: 'left',//如果为'right'则会在右边固定
      width: 100,
    },
    {
      title: "预算项目",
      dataIndex: 'b',
      // fixed:'right',//设置预算项目列滚动
      width: 110,
    },
    {
      title: "批复金额",
      dataIndex: 'c',
      width: 150,
      columnClass: 'money-text',
      headerRender(txt) {
        return <div>{txt}</div>
      },
      render(money) {
        return <div className={'text-right'}>{money}</div>
      }
    },
    {
      title: "剩余可用预算",
      dataIndex: 'd',
      width: 150,

      columnClass: 'money-text',
      render(money) {
        return <div className={'text-right'}>{money}</div>
      }
    },
  ]
  // const data = genData();
  function genData(init) {
    const tempData = init ? [] : data;
    let i = 10;
    while (i--) {
      tempData.push({ a: `a${i}`, b: `b${i}谁发的都是`, c: `c${i}`, d: `d${i}` })
    }
    return tempData;
  }
  /* 上拉刷新 */
  const pullRefresh = () => {
    Promise.resolve((() => {
      return setData(genData(1))
    })())
  }

  const loadMore = () => {
    Promise.resolve((() => {
      return setData(genData())
    })())
  }


  const onRowClick = (tdata, index) => {
    tdata.show = !tdata.show
    setData([...data])
  }
  return (
    <div className={'container'}>
      <Table onRowClick={(data, index) => onRowClick(data, index)} columns={columns} dataSource={data} tableLayout={'fixed'} tableHeight={height} pullRefresh={pullRefresh} loadMore={loadMore} />
    </div>
  )
}

export default TableCon
