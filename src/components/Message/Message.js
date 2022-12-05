import './message.css'
import moment from 'moment'
export default function Message({message, own, user, title}){
console.log(title)

    return (
        <div className={own ? "message own" : "message" }>
            <div className='messageTop'>
            <div id="profileImageMessage">{ own ? user[0].userId?.split(' ').map(name => name[0]).join('').toUpperCase() : title?.split(' ').map(name => name[0]).join('').toUpperCase()}</div>
            <p className='messageText'>
                {message.text}
            </p>
            </div>
            <div className='messageBottom'>{moment(message.createdAt).fromNow()}</div>

        </div>
    )
}