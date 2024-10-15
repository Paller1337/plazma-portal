import { withAdminAuthServerSideProps } from 'helpers/withAdminAuthServerSideProps'
import { NAV } from 'nav'
import { GetServerSideProps } from 'next'

export default function AdminRedirectPage() {
  return null
}

export const getServerSideProps: GetServerSideProps = withAdminAuthServerSideProps(async (context) => {
  const menu = NAV.menuItems

  return {
    props: {
      // destination: '/admin/portal/orders',
      // permanent: true,
    },
  }
}, ['redirect'])
