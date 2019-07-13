import React from 'react'
import TimeKeeper, { Props as TimeKeeperProps } from './TimeKeeper'
import { ConfigProvider, Styles, ConfigProps } from '../hooks/config'

interface Props extends TimeKeeperProps, ConfigProps {}

export default function TimepickerWithConfig({
	time,
	onChange,
	// config props:
	coarseMinutes,
	styles = {},
	switchToMinuteOnHourSelect,
	closeOnMinuteSelect,
	onDoneClick,
}: Props) {
	return (
		<ConfigProvider
			styles={styles}
			coarseMinutes={coarseMinutes}
			switchToMinuteOnHourSelect={switchToMinuteOnHourSelect}
			closeOnMinuteSelect={closeOnMinuteSelect}
			onDoneClick={onDoneClick}
		>
			<TimeKeeper onChange={onChange} time={time} />
		</ConfigProvider>
	)
}