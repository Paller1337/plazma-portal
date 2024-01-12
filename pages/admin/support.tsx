import AdminHeader from '@/components/admin/AdminHeader';
import { AppShell, Burger, Group, ScrollArea, Skeleton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'


export default function AdminSupportPage() {
    const [opened, { toggle }] = useDisclosure()

    return (
        <>
            <main className='admin-page'>
                <AppShell
                    header={{ height: 64 }}
                    navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
                    padding="md"
                >
                    <AppShell.Navbar p="md">
                        <AppShell.Section>
                            <span className='admin-sideNav__title'>Список заявок</span>
                        </AppShell.Section>
                        <AppShell.Section grow my="md" component={ScrollArea} >
                            <div className='admin-sideNav__wrapper'>
                                {Array(7)
                                    .fill(0)
                                    .map((_, index) => (
                                        <div key={'side-nav-' + index} className='admin-sideNav__item'></div>
                                    ))}
                            </div>
                        </AppShell.Section>
                        {/* <AppShell.Section>Navbar footer – always at the bottom</AppShell.Section> */}
                    </AppShell.Navbar>
                    <AppShell.Main>
                        Main

                    </AppShell.Main>
                </AppShell>
            </main>
        </>
    );
}