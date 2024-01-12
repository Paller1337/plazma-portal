import { Card, Image, Text, Group, Badge, Button, ActionIcon, Stack } from '@mantine/core'
// import classes from './BadgeCard.module.css';

const mockdata = {
    image:
        'https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
    title: 'Домик на набережной 3',
    customer: 'Анастасия Сычева',
    country: 'Croatia',
    description:
        'Completely renovated for the season 2020, Arena Verudela Bech Apartments are fully equipped and modernly furnished 4-star self-service apartments located on the Adriatic coastline by one of the most beautiful beaches in Pula.',
    badges: [
        { emoji: '☀️', label: 'Sunny weather' },
        { emoji: '🦓', label: 'Onsite zoo' },
        { emoji: '🌊', label: 'Sea' },
        { emoji: '🌲', label: 'Nature' },
        { emoji: '🤽', label: 'Water sports' },
    ],
};


export default function ServiceOrder(props) {
    const { image, title, description, country, badges, customer } = mockdata;
    const features = badges.map((badge) => (
        <Badge variant="light" key={badge.label} leftSection={badge.emoji}>
            {badge.label}
        </Badge>
    ));

    return (
        <Card withBorder radius="md" p="md" className={'admin-serviceOrder__card'}>
            {/* <Card.Section>
                <Image src={image} alt={title} height={180} />
            </Card.Section> */}

            <Stack>
                <Group justify="apart">
                    <Text fz="lg" fw={500}>
                        {title}
                    </Text>
                    <Text fz="sm" fw={500}>
                        {customer}
                    </Text>
                    <Badge size="sm" variant="light">
                        {country}
                    </Badge>
                </Group>
                <Text fz="sm" mt="xs">
                    {description}
                </Text>
            </Stack>

            {/* <Card.Section className={''}>
                <Text mt="md" className={''} c="dimmed">
                    Perfect for you, if you enjoy
                </Text>
                <Group gap={7} mt={5}>
                    {features}
                </Group>
            </Card.Section> */}

            <Group mt="xs">
                <Button radius="md" style={{ flex: 1 }}>
                    Открыть заказ
                </Button>
            </Group>
        </Card>

    )
}