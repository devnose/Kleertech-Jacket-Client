import Conversations from "../Conversations/Conversations"
import "./submenu.css"

export default function SubMenu({groups}) {
    return(
        <div className="conversations">     
            <span className="submenu" >{groups}</span>

        </div>
    )
}