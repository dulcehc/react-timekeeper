import React, { useState, useCallback } from 'react'
import { Global, css, jsx } from '@emotion/core'

import globalStyle from './styles/global'
import style from './styles/main'
import useConfig from '../hooks/config'
import ClockWrapper from './ClockWrapper'
import { TimeInput, ChangeTimeFn } from '../helpers/types'
import { MODE, CLOCK_VALUES, HOURS_12 } from '../helpers/constants'
import useHandleTime from '../hooks/handle-time'

export interface Props {
	time: TimeInput
	onChange: ChangeTimeFn
}

export default function TimeKeeper({ onChange, time: parentTime }: Props) {
	const { time, setTime } = useHandleTime(parentTime, onChange)
	const [mode, setMode] = useState(MODE.HOURS_12)

	const config = useConfig()

	/*
		- calls time update on component and parent
		- handles any mode switching or closing
	*/
	const updateTime = useCallback(
		(val: number, canAutoChangeUnit: boolean) => {
			// TODO - is this necessary?
			val = parseInt(val, 10)
			if (isNaN(val)) {
				console.error('DEBUG :: NOT A NUMBER!')
				return
			}

			// const increments = CLOCK_VALUES[mode].increments
			let unit: 'hour' | 'minute'
			switch (mode) {
				case MODE.HOURS_12:
					unit = 'hour'
					if (val === 0) {
						val = 12
					}
					break
				case MODE.MINUTES:
					unit = 'minute'
					if (val === 60) {
						val = 0
					}
					break
				// TODO - add support for 24 hrs
			}

			// TODO - fix type
			// update individual value on component
			const newTime = { ...time, [unit]: val }
			setTime(newTime)

			// handle any unit autochanges or closeos
			if (!canAutoChangeUnit) {
				return
			}

			const isHourMode = mode === MODE.HOURS_12 || mode === MODE.HOURS_24
			const isMinuteMode = mode === MODE.MINUTES
			if (config.switchToMinuteOnHourSelect && isHourMode) {
				setMode(MODE.MINUTES)
			} else if (config.closeOnMinuteSelect && isMinuteMode) {
				config.onDoneClick && config.onDoneClick()
			}
		},
		[config, mode, setTime, time],
	)

	/*
		LOGIC AROUND COARSE
		- on drag, if count < 2, do not force coarse
		- on mouseup, if count < 2 do not force coarse
		- handlepoint
			- if config OR forceCoarse arg, then coarse it
			- since now providing option for coarse... need a more sophisticated method?
		- coarse is just rounding number to an increment before setting unit

		LOGIC AROUND CAN CHANGE UNIT
		- on drag, CAN NOT change unit
		- on mouseup, can change unit
		- AFTER time has been set, then determine if need to change unit
			- based on this and user input
	*/

	/*
		converts angle into time, also factors in any rounding to the closest increment
	*/
	const calculateTimeValue = useCallback(
		(angle, { canAutoChangeUnit = false, wasTapped = false }) => {
			/*
				TODO
				- if coarse, avoid the double calculation
				- first check if coarse, and then do one or either
			*/

			// calculate value based on current clock increments
			const increments = CLOCK_VALUES[mode].increments
			let selected = Math.round((angle / 360) * increments)

			/*
				TODO
				- clean up this logic, make it reusable for hours as well
				- add hours coarse as well
					- add a coarse object to config?
					- but pass in to component as separate?
				- fade out numbers depending on whether is has coarse value
					- for this, should calculate all numbers and determine
					which ones are faded out and cache
			*/

			/* if (mode === MODE.MINUTES) {
				const coarseMinutes = config.coarseMinutes
				const roundValue = coarseMinutes > 1 || wasTapped
				if (roundValue) {
					// number was just tapped so account for fat finger
					// or coarse increments are enabled
					const multiplier = coarseMinutes > 1 ? coarseMinutes : 5
					// const multiplier = CLOCK_DATA[unit].coarseMultiplier;
					selected = Math.round(selected / multiplier) * multiplier
				}
			} */

			// update time officially on this component
			updateTime(selected, canAutoChangeUnit)
		},
		[updateTime, mode],
	)

	return (
		<>
			<Global styles={css(globalStyle)} />

			<div className="react-timekeeper" css={[style, config.styles.main]}>
				{time.hour}:{time.minute}
				<button
					onClick={() => {
						setMode(mode === MODE.HOURS_12 ? MODE.MINUTES : MODE.HOURS_12)
					}}
				>
					change type - {mode}
				</button>
				<br />
				<br />
				<br />
				<br />
				{/* TODO - top bar */}
				<ClockWrapper time={time} mode={mode} calculateTimeValue={calculateTimeValue} />
				{/* TODO - done button */}
			</div>
		</>
	)
}