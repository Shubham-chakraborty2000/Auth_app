import {useContext} from "react";
import { Navigate, replace } from "react-router-dom";
import { AuthContext } from "../AuthenContext/AuthContext";

const ProtectedRoute=({children})=>{
    const {token}=useContext(AuthContext);

    if(!token){
        return <Navigate to="/login" replace/>;
    }
    else{
        return children;
    }
}
export default ProtectedRoute