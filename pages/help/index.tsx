import IndexNavButton from '@/components/IndexNavButton'
import NavBar from '@/components/NavBar'
import { useAuth } from 'context/AuthContext'
import { getFAQList } from 'helpers/faq'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ReactSVG } from 'react-svg'
import { BlocksRenderer } from '@strapi/blocks-react-renderer'


interface HelpPageProps {
    faqs: any
}

export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    try {
        const faqs = await getFAQList()
        return {
            props: {
                faqs: faqs
            } as HelpPageProps
        }
    } catch (error) {
        console.error('Ошибка ...:', error)
        return {
            props: {}
        }
    }
})

interface FAQCardProps {
    question?: string
    answer?: any[]
}
const FAQCard = (props: FAQCardProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const toggle = () => setIsOpen(isOpen => !isOpen)
    return (
        <div className='faq-card'>
            <div className='faq-card__header' onClick={toggle} >
                <span className='faq-card__question'>
                    {props.question}
                </span>
                <ReactSVG className='faq-card__toggle' src={'/svg/faq-plus.svg'} />
            </div>

            <div className={`faq-card__content${!isOpen ? ' closed' : ''}`}>
                <BlocksRenderer content={props.answer} />
            </div>
        </div>
    )
}

export default function HelpPage(props: HelpPageProps) {
    useEffect(() => {
        console.log(props.faqs[0])
    }, [])
    return (<>
        <main className='--gray-main'>
            <div className='page-wrapper'>
                <div className='help-content'>
                    
                    <span className='faq-title'>Часто задаваемые вопросы</span>
                    <div className='faq-list'>
                        {props.faqs.length ? props.faqs.map((x, i) => (
                            <FAQCard key={x.attributes.question + i} question={x.attributes.question} answer={x.attributes.answer} />
                        )) : <></>}
                    </div>
                </div>
            </div>
        </main>


        <NavBar page='help' />
    </>)
}