import Link from 'next/link'
import { ReactSVG } from 'react-svg'

interface HeaderUnderProps {
    title: string
    onClick?: () => void
}

export default function HeaderUnder(props: HeaderUnderProps) {

    return (
        <div className='header-under__wrapper'>
            <div className='header-under'>
                {props.onClick ?
                    <div className='header-under__link'>
                        <span onClick={props.onClick}>
                            <ReactSVG className='header-under__link-img' src='/svg/back.svg' />
                        </span>

                    </div>
                    :
                    <></>
                }
                <span className='header-under__text'>
                    {props.title}
                </span>
            </div>
        </div>
    )
}