import { Carousel } from '@mantine/carousel'
import { Button, Divider, Group, SegmentedControl, Stack } from '@mantine/core'
import { MenusV2Response } from 'helpers/iiko/IikoApi/types'
import { Dispatch, useState } from 'react'

interface EatMenuControlProps {
    data: MenusV2Response
    onChange: Dispatch<any>
    currentMenuId: string
}
export default function EatMenuControl({ data, onChange, currentMenuId }: EatMenuControlProps) {
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
                {data?.externalMenus.map((x, i) => (
                    <Carousel.Slide key={x.id}>
                        <Group>
                            <Button
                                color={currentMenuId === x.id ? '#56754B' : '#495057'}
                                variant={currentMenuId === x.id ? 'filled' : 'transparent'}
                                onClick={currentMenuId === x.id ? () => null : () => { onChange(x.id) }}
                                // onClick={() => {
                                //     onChange(x.id)
                                //     console.log('123')
                                // }}
                                radius={'lg'}
                                py={8}
                            >
                                {x.name}
                            </Button>
                            {i < (data?.externalMenus.length - 1) && <Divider orientation='vertical' />}
                        </Group>
                    </Carousel.Slide>
                ))}
            </Carousel>
        </Stack>
    )
}