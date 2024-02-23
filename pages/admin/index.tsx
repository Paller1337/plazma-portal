import { GetServerSideProps } from 'next'

export default function AdminIndexPage() {
    return null
  }
  
  export const getServerSideProps: GetServerSideProps = async (context) => {
    return {
      redirect: {
        destination: '/admin/services',
        permanent: true,
      },
    }
  }
  