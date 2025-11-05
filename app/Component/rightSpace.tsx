import { useState } from "react";
import { HoverSocialIcon } from "./HoverSocialIcon"

const RighSpace = ({ip = "0"}) => {
    
    
  return (
    <>
    {/* User Info Simulation */}
                        <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                            <p className="text-sm font-semibold text-teal-800">Session IP:</p>
                            <p className="font-mono text-xs text-teal-600 break-words">{ip}</p>
                        </div>
      <div className="mb-4 text-center" >
                        <HoverSocialIcon
                network="github"
                url="https://github.com/jivimuz"
                color="#333" // GitHub
                />
                <HoverSocialIcon
                network="linkedin"
                url="https://www.linkedin.com/in/jivimuz"
                color="#0A66C2"
                />
                <HoverSocialIcon
                network="instagram"
                url="https://www.instagram.com/jivimz_"
                color=" #962fbf"
                />
                <HoverSocialIcon
                network="email"
                url="mailto:jivirasgal@gmail.com"
                color=" #be2323ff"
                />
        </div></>
  )
}

export default RighSpace