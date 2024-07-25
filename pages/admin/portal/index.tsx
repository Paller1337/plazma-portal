import { GetServerSideProps } from 'next'

export default function AdminRedirectPage() {
  return null
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: {
      destination: '/admin/portal/orders',
      permanent: true,
    },
  }
}
