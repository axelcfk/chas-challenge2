
import { FaStar } from "react-icons/fa"

export function MovieCardMix({title, poster, overview, voteAverage, streamingServices}) {

  return (
    <div className="flex h-36 w-full">
      <img
          className="flex w-24 h-full mr-3 rounded-md"
          src={poster}
          alt={title}
        />
        <div className="flex flex-col gap-4"> 

          <h3>{title}</h3>
          <div className="flex gap-2 justify-start items-center">
            
                      <FaStar color="yellow" />
                      <p>{voteAverage}</p>
                   
            
          </div>
          <p>{streamingServices}</p>
          
        </div>
    </div>
  )
}
