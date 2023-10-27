import React from "react";

import { animated, useTrail } from "react-spring"

type IProps = {
    open: boolean;
    onStart?: () => void;
    onEnd?: () => void;
    onCloseEnd?: () => void;
    children: any;
}

export default function Trail(props: IProps) {

    let a = 0;

    const items = React.Children.toArray(props.children);
    const trail = useTrail(items.length, {
        config: {
            mass: 5,
            tension: 2000,
            friction: 200
        },
        opacity: props.open ? 1 : 0,
        x: props.open ? 0 : 20,
        from: {
            opacity: 0,
            x: 20
        },
        onStart: () => {
            
            if(props.onStart !== undefined) {
                props.onStart();
            }

        },
        onResolve: () => {

            if (++a === 2) {

                if (props.onEnd !== undefined) {
                    props.onEnd();
                }

                if (props.onCloseEnd !== undefined) {
                    if (!props.open) {
                        props.onCloseEnd();
                    }
                }
            }
        }
    });

    return (
        <div>
            {
                trail.map(({ ...style }, index) => (
                    <animated.div
                        key={index}
                        style={style}
                    >
                        {
                            items[index]
                        }
                    </animated.div>
                ))
            }
        </div>
    )
}