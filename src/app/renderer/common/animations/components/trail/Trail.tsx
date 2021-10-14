import React from "react";

import { animated, useTrail } from "react-spring"
export default function Trail(props: { open: boolean, children: any }) {

    const items = React.Children.toArray(props.children);
    const trail = useTrail(items.length, {
        config: {
            mass: 5,
            tension: 2000,
            friction: 150
        },
        opacity: props.open ? 1 : 0,
        x: props.open ? 0 : 20,
        from: {
            opacity: 0,
            x: 20
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