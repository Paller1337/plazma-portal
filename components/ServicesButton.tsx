import Image from 'next/image'
import Link from 'next/link'

interface ServicesButtonProps {
    title: string
    desc: string
    link?: string
    image: string
}

export default function ServicesButton(props: ServicesButtonProps) {

    return (<>
        <Link className='services-button' href={props.link ? props.link : '/'}>
            <div className='services-button__dark_opacity' />
            <div className='services-button__dark_opacity-gradient' />
            <div className='services-button__content'>
                <span className='services-button__title'>{props.title}</span>
                <span className='services-button__desc'>{props.desc}</span>
            </div>

            <Image className='services-button__image' src={props.image} height={382} width={220} alt='' unoptimized={true} />
        </Link>
    </>)
}