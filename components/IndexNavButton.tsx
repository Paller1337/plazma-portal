import { ReactSVG } from 'react-svg'

interface IndexNavButtonProps {
    isHelpButton?: boolean
    title?: string
    desc?: string
    status?: string
    svgName?: string
}

export default function IndexNavButton(props: IndexNavButtonProps) {

    return (<>
        <div className={`index-nav__button ${props.isHelpButton ? 'index-nav__button_help' : ''}`}>
            <div className='index-nav__logo'>
                <ReactSVG src={`/svg/nav/${props.svgName}.svg`} />
            </div>
            <span className='index-nav__title'>{props.title}</span>
            <div className='index-nav__desc-row'>
                <span className='index-nav__desc'>{props.desc}</span>
                {props.status ?
                    <div className='index-nav__desc-status' style={{ backgroundColor: `${props.status}` }} /> :
                    <></>
                }
            </div>

            {props.isHelpButton ?
                <div className='index-nav__inner-btn'>
                    Новая заявка
                </div>
                
                : <></>
            }

            <div className='index-nav__bg-logo'>
                <ReactSVG src={`/svg/nav/${props.svgName}-light.svg`} />
            </div>
        </div>
    </>)
}