import { GetServerSideProps } from 'next'

export default function OrderPage() {
  return null
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: {
      destination: '/basket/1',
      permanent: true,
    },
  }
}
