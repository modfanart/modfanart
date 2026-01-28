import { useState, useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import Calendar from '@/components/ui/Calendar'
import ScrollBar from '@/components/ui/ScrollBar'
import CreateEventDialog, { eventTypes } from './CreateEventDialog'
import { eventGenerator, isToday } from '../utils'
import classNames from '@/utils/classNames'
import dayjs from 'dayjs'
import moment from 'jalali-moment';
import type { FormSchema as CreateEventPayload } from './CreateEventDialog'
import type { Event } from '../types'

type ScheduledEvent = {
    id: string
    type: Event
    label: string
    time?: Date
}

type ScheduledEventProps = ScheduledEvent

const ScheduledEvent = (props: ScheduledEventProps) => {
    const { type, label, time } = props

    const event = eventTypes[type]

    return (
        <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-3">
                <div>
                    <Avatar
                        className={classNames('text-gray-900', event?.color)}
                        icon={event?.icon}
                        shape="round"
                    />
                </div>
                <div>
                    <div className="font-bold heading-text">{label}</div>
                    <div className="font-normal">{event?.label}</div>
                </div>
            </div>
            <div>
                <span className="font-semibold heading-text">
                    {time && dayjs(time).format('hh:mm')}{' '}
                </span>
                <small>{time && moment(time).locale('fa').format('A')}</small>
            </div>
        </div>
    )
}

const UpcomingSchedule = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        dayjs().toDate(),
    )
    const [createdEventCache, setCreatedEventCache] = useState<
        Record<string, ScheduledEvent[]>
    >({})

    const eventList = useMemo(() => {
        const date = selectedDate
        const previousCreatedEvent =
            createdEventCache[dayjs(date).toISOString()] || []
        const eventList = [
            ...eventGenerator(date as Date),
            ...previousCreatedEvent,
        ]

        return eventList.sort((a, b) => {
            if (!a.time && !b.time) {
                return 0
            }
            if (!a.time) {
                return 1
            }
            if (!b.time) {
                return -1
            }
            return a.time.getTime() - b.time.getTime()
        })
    }, [selectedDate, createdEventCache])

    const handleCreateEvent = (value: CreateEventPayload & { id: string }) => {
        const payload = {
            id: value.id,
            label: value.label,
            type: value.type,
            time: dayjs(selectedDate)
                .set('hour', value.time)
                .set('minute', 0)
                .toDate(),
        }
        setCreatedEventCache((prevRecord) => {
            if (prevRecord[dayjs(selectedDate).toISOString()]) {
                prevRecord[dayjs(selectedDate).toISOString()].push(payload)
            } else {
                prevRecord[dayjs(selectedDate).toISOString()] = [payload]
            }

            return structuredClone(prevRecord)
        })
    }

    return (
        <Card>
            <div className="flex flex-col md:flex-row xl:flex-col md:gap-10 xl:gap-0">
                <div className="flex items-center mx-auto w-[280px]">
                    <Calendar
                        value={selectedDate}
                        onChange={(val) => {
                            setSelectedDate(val)
                        }}
                    />
                </div>
                <div className="w-full">
                    <div className="my-6">
                        <h5>
                            برنامه ریزی کنید{' '}
                            {isToday(selectedDate as Date)
                                ? 'امروز'
                                : moment(selectedDate || '').locale('fa').format('DD MMM')}
                        </h5>
                    </div>
                    <div className="w-full">
                        <ScrollBar className="overflow-y-auto h-[280px] xl:max-w-[280px]">
                            <div className="flex flex-col gap-4">
                                {eventList.map((event) => (
                                    <ScheduledEvent key={event.id} {...event} />
                                ))}
                            </div>
                        </ScrollBar>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <CreateEventDialog onCreateEvent={handleCreateEvent} />
            </div>
        </Card>
    )
}

export default UpcomingSchedule
