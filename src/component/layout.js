import { renderRoutes } from 'react-router-config';
import { NavLink } from "react-router-dom";
function Layout (props) {
 
    return (
        <div>
            <div> <NavLink to="/" >1</NavLink>  <NavLink to="/c" >2</NavLink> <NavLink to="/d" >3</NavLink>   </div>
            <div>
            { renderRoutes(props.route.routes) }
            </div>
        </div>
    )
}

export default Layout