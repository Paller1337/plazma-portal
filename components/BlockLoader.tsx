import ContentLoader from 'react-content-loader'

export default function BlockLoader(props: { width: number | string, height: number, color?: string }): JSX.Element {

    return (
        <ContentLoader
            speed={3}
            width={props.width}
            height={props.height}
            viewBox={'0 0 ' + props.width + ' ' + props.height}
            backgroundColor={props.color ?? '#252525'}
            foregroundColor={'#ecebeb'}
            {...props}
        >
            <rect x='0' y='0' rx='20' ry='20' width={props.width} height={props.height} />
        </ContentLoader>
    )
}
