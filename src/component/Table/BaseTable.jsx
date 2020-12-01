import React from 'react';
import './index.less';

/* table 做 一级 表头 */
/* transform的移动 要点：
  1、header 滚动：只有主table会随着滚动，固定的列不随着滚动，并且滚动的方向只能在 x 方向
  2、body 互动：主table x，y都要滚动，固定列只滚动 y；

  // 定义 scrollType ： main，left | right
*/
function Table(props) {
  const {
    onRowClick,
    dataSource,
    columns,
    width = '375',
    height,
    scrollRef,
    className,
    scrollClassName,
    scrollType = 'main',
    realTableBodyRef,
    inherScroll = false,
    loading,
    x,
    y
  } = props;
    
  const genTransform = ((type) => {
    return (pos) => {
      if (type === 'main') {
        if (pos === 'header') {
          return {transform: `translateX(${x}px)`}
        }
        if (pos === 'body') {
          return { transform: `translate(${x}px, ${y}px)`}
        }
      }
      if (type === 'left' || type === 'right') {
        if (pos === 'body') {
          return {transform: `translateY(${y}px)`}
        }
      }
    }
  })(scrollType)

  const rowClick = (data,index)=>{
    if(onRowClick&&onRowClick instanceof Function){
      onRowClick(data,index)
    }
  }
  return (
    <div className={className ? `${className} table-content` : 'table-content'}>
      <div className={`table-header  ${inherScroll ? 'fixed-table-anima' : ''}`} style={width ? { width: width, ...genTransform('header') } : genTransform('header')}>
        <table className={'fixed-table'}>
          <thead>
            <tr>
              {columns
                ? columns.map((item, index) => (
                  <th
                    key={'columns_' + index + 1}
                    width={item.width ? item.width : ''}
                    className={item.columnClass ? item.columnClass : ''}
                    style={item.width && item.fixed ? { maxWidth: item.width } : null}
                  >
                    {
                      item.headerRender && item.headerRender instanceof Function ? item.headerRender(item.title,item) :<span className={'header-column'}>{item.title}</span>
                    }
                  </th>
                ))
                : null}
            </tr>
          </thead>
        </table>
      </div>
      {/* ,overflowY:'auto' scroll控制滚动 */}
      <div
        className={`table-body ${scrollClassName ? scrollClassName : ''} ${loading === 1 ? 'table-body-load': ''} ${loading === 2 ? 'table-body-more': ''}`}
        style={{ width: width, height: height - 41 + 'px' }}
        ref={scrollRef ? scrollRef : null}
      >
        <table className={`fixed-table ${inherScroll ? 'fixed-table-anima' : ''}`} style={genTransform('body')} ref={realTableBodyRef}>
          <tbody>
            {dataSource && columns
              ? dataSource.map((dataItem, dataIndex) => (
                <React.Fragment key={dataIndex}>
                  <tr key={'data_' + dataIndex} onClick={()=>rowClick(dataItem,dataIndex)}>
                    {columns.map((columnItem, columnIndex) => (
                        <td
                          key={columnIndex}
                          width={columnItem.width ? columnItem.width : null}
                          className={columnItem.columnClass ? columnItem.columnClass : null}
                        >
                          {columnItem.render && columnItem.render instanceof Function ? (
                            columnItem.render(dataItem[columnItem.dataIndex],dataItem,columnItem.dataIndex)
                          ) : (
                            <span>{dataItem[columnItem.dataIndex]}</span>
                          )}
                        </td>
                      ))}
                  </tr>
                  {dataItem.show&&<tr ><td style={{position:"relative" }} colSpan={columns.length}>
                  {
                    scrollType === 'main' ? (<div style={{position:'absolute',top:0,bottom:0,left:0,right:0,border:'1px solid black'}}>
                    dsfsdfsdfsdf
                  </div>):null
                  }
                  </td></tr>}
                </React.Fragment>
              ))
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Table;
