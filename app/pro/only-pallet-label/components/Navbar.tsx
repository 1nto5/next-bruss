import Link from 'next/link'
import { FaYoutube } from 'react-icons/fa'

export default function Navbar() {
  return (
    <nav className="ml-6 mr-6 flex flex-wrap items-center justify-between p-2">
      <div className="flex flex-shrink-0 items-center text-slate-900">
        <span className="text-xl tracking-wider">Only Pallet Label</span>
      </div>
      {/* <div>
        {props.endBox &&
          props.articleLogged &&
          props.userLogged &&
          props.workplaceLogged && (
            <HeaderLinkButtonRed
              text="zakończ box"
              onClick={handleClickBoxEnd}
            />
          )}
        {props.articleLogged && (
          <HeaderLinkButton
            text="zmień artykuł"
            onClick={handleClickArticleLogout}
          />
        )} */}

      {/* {!props.workplaceLogged && (
          <HeaderLinkButton
            text="stanowisko"
            onClick={handleClickWorkplaceLogout}
          />
        )} */}
      {/* </div> */}
      <button>Test</button>
    </nav>
  )
}
