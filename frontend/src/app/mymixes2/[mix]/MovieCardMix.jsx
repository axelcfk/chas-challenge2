
import { FaStar } from "react-icons/fa"
import Link from "next/link"

export function MovieCardMix({title, id, poster, overview, voteAverage, streamingServices}) {

  return (
    <div className="flex h-36 w-full">
      <Link href={`/movie/${encodeURIComponent(id)}`}>
      <img
          className="flex w-24 h-full mr-3 rounded-md"
          src={poster}
          alt={title}
        />
        </Link>
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
