import { Carousel } from '@mantine/carousel'
import { Button, Divider, Group, SegmentedControl, Stack } from '@mantine/core'
import { MenusV2Response } from 'helpers/iiko/IikoApi/types'
import { IPortalMenu } from 'pages/store/eat'
import { Dispatch, useState } from 'react'

interface EatMenuControlProps {
    data: MenusV2Response
    portalMenu: IPortalMenu[]
    onChange: Dispatch<any>
    currentMenuId: string
}
export default function EatMenuControl({ data, onChange, currentMenuId, portalMenu }: EatMenuControlProps) {
    const initSlide = portalMenu?.findIndex(x => x.menuId.toString() === currentMenuId)

    return (
        <Stack
            style={{
                borderRadius: '20px 0 0 20px',
                background: '#f1f3f5',
                overflow: 'hidden',
            }}
            px={4}
            py={4}
            mr={-24}
        >
            <Carousel
                slideSize={'auto'}
                orientation='horizontal'
                height={'fit-content'}
                align="start"
                slideGap="xs"
                controlsOffset="xs"
                initialSlide={initSlide}
                controlSize={14}
                dragFree
                withControls={false}
                styles={{
                    viewport: {
                        overflow: 'visible'
                    },
                    // slide: {
                    //     width: '50vw !important',
                    //     maxWidth: '50vw !important'
                    // }
                }}
                containScroll={'keepSnaps'}
            >
                {/* <Carousel.Slide>
                    <Stack mt={20}
                        style={{
                            overflowX: 'auto',
                            // display: 'block',
                            whiteSpace: 'nowrap',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        <SegmentedControl
                            color="#56754B"
                            data={data?.externalMenus.map(x => ({ value: x.id, label: `${x.name}` }))}
                            radius={'lg'}
                            // defaultValue=''
                            size='sm'
                            w={'fit-content'}
                            onChange={onChange}
                        />
                    </Stack>
                </Carousel.Slide> */}
                {portalMenu?.map((x, i) => {

                    return (
                        <Carousel.Slide key={x.menuId}>
                            <Group>
                                <Button
                                    color={currentMenuId === x.menuId?.toString() ? '#56754B' : '#495057'}
                                    variant={currentMenuId === x.menuId?.toString() ? 'filled' : 'transparent'}
                                    onClick={currentMenuId === x.menuId?.toString() ? () => null : () => { onChange(x.menuId?.toString()) }}
                                    // onClick={() => {
                                    //     onChange(x.id)
                                    //     console.log('123')
                                    // }}
                                    radius={'lg'}
                                    py={8}
                                >
                                    {x.title}
                                </Button>
                                {i < (data?.externalMenus.length - 1) && <Divider orientation='vertical' />}
                            </Group>
                        </Carousel.Slide>
                    )
                })}
            </Carousel>
        </Stack>
    )
}