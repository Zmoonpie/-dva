import React, { lazy, Suspense } from "react";
 
import Layout from '../component/layout'
const SuspenseComponent = Component => props => {
     
    return (
        <Suspense fallback={null}>
            <Component {...props}></Component>
        </Suspense>
    )
}
const index = lazy(() => import('../page/view/index'))
const index2 = lazy(()=>import('../page/view/index2'))
const index3 = lazy(()=>import('../page1/view/index'))
// eslint-disable-next-line import/no-anonymous-default-export
export default [
    {
      
        component: Layout,
        routes: [
            { exact: true,
                path: "/",
                component: SuspenseComponent(index),
               
            },
            {
                path: "/c",
                component: SuspenseComponent(index2),
               
            },
            {
                path: "/d",
                component: SuspenseComponent(index3),
               
            }
        ]
    }
]