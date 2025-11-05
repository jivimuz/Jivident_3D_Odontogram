import { useState } from "react";
import { HoverSocialIcon } from "./HoverSocialIcon"

const RighSpace = ({}) => {
    
    
  return (
    <>
    {/* User Info Simulation */}
                     
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