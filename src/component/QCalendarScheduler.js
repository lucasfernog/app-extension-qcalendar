// Styles
import './calendar-scheduler.styl'

// Directives
import Resize from './directives/resize'

// Mixins
import CalendarIntervals from './mixins/calendar-intervals'

// Util
import { convertToUnit } from './utils/helpers'
import {
  copyTimestamp
} from './utils/timestamp'

/* @vue/component */
export default CalendarIntervals.extend({
  name: 'q-calendar-scheduler',

  directives: { Resize },

  data () {
    return {
      scrollWidth: 0
    }
  },

  computed: {
    classes () {
      return {
        'q-calendar-scheduler': true
      }
    },
    bodyHeight () {
      return this.resources.length * this.parsedIntervalHeight
    }
  },

  mounted () {
    this.init()
  },

  watch: {
    noScroll (val) {
      if (val === true) {
        this.scrollWidth = 0
      } else {
        this.$nextTick(this.onResize)
      }
    }
  },

  methods: {
    init () {
      this.$nextTick(this.onResize)
    },

    onResize () {
      this.scrollWidth = this.getScrollWidth()
    },

    getScrollWidth () {
      const area = this.$refs.scrollArea
      const pane = this.$refs.pane

      return area && pane ? (area.offsetWidth - pane.offsetWidth) : 0
    },

    getScopeForSlot (timestamp, idx, resource) {
      const scope = copyTimestamp(timestamp)
      scope.resourceStartPos = this.resourceStartPos
      if (idx !== void 0) {
        scope.index = idx
      }
      if (resource !== void 0) {
        scope.resource = resource
      }
      return scope
    },

    resourceStartPos (resource, clamp = true) {
      const index = this.resource.indexOf(resource)
      let y = index * this.parsedIntervalHeight

      if (clamp) {
        if (y < 0) {
          y = 0
        }
        if (y > this.bodyHeight) {
          y = this.bodyHeight
        }
      }

      return y
    },

    __renderHead (h) {
      return h('div', {
        staticClass: 'q-calendar-scheduler__head',
        style: {
          marginRight: this.scrollWidth + 'px'
        }
      }, [
        this.__renderHeadResources(h),
        ...this.__renderHeadDays(h)
      ])
    },

    __renderHeadResources (h) {
      const slot = this.$scopedSlots.schedulerResourcesHeader

      let colors = new Map(), color, backgroundColor
      let updateColors = this.useDefaultTheme
      if (this.enableThemes === true) {
        color = 'colorIntervalHeader'
        backgroundColor = 'backgroundIntervalHeader'
        colors = this.getThemeColors([color, backgroundColor])
        updateColors = this.setBothColors
      }

      return h('div', updateColors(colors.get(color), colors.get(backgroundColor), {
        staticClass: 'q-calendar-scheduler__resources-head q-calendar-scheduler__resources-head--text'
      }), [
        slot ? slot(this.days) : ''
      ])
    },

    __renderHeadDays (h) {
      if (this.days.length === 1 && this.columnCount && parseInt(this.columnCount) > 1) {
        return [...Array(parseInt(this.columnCount))]
          .map((_, i) => i + parseInt(this.columnIndexStart))
          .map((idx) => this.__renderHeadDay(h, this.days[0], idx))
      } else {
        return this.days.map((day) => this.__renderHeadDay(h, day))
      }
    },

    __renderHeadDay (h, day, idx) {
      const slot = this.$scopedSlots.schedulerDayHeader
      const scope = this.getScopeForSlot(day, idx)
      let dragOver

      let colors = new Map(), color, backgroundColor
      let updateColors = this.useDefaultTheme
      if (this.enableThemes === true) {
        if (day.past === true) {
          color = 'colorHeaderPast'
          backgroundColor = 'backgroundHeaderPast'
        } else if (day.current === true) {
          color = 'colorHeaderCurrent'
          backgroundColor = 'backgroundHeaderCurrent'
        } else if (day.future === true) {
          color = 'colorHeaderFuture'
          backgroundColor = 'backgroundHeaderFuture'
        }
        colors = this.getThemeColors([color, backgroundColor])
        updateColors = this.setBothColors
      }

      return h('div', updateColors(colors.get(color), colors.get(backgroundColor), {
        key: day.date + (idx !== void 0 ? `-${idx}` : ''),
        staticClass: 'q-calendar-scheduler__head-day',
        class: {
          ...this.getRelativeClasses(day),
          'q-calendar-scheduler__head-day--droppable': dragOver
        },
        domProps: {
          ondragover: (e) => {
            if (this.dragOverFunc !== void 0) {
              dragOver = this.dragOverFunc(e, day, 'day', idx)
            }
          },
          ondrop: (e) => {
            if (this.dropFunc !== void 0) {
              this.dropFunc(e, day, 'day', idx)
            }
          }
        },
        on: this.getDefaultMouseEventHandlers(':day', _event => {
          return scope
        })
      }), [
        this.columnHeaderBefore === true ? this.__renderColumnHeaderBefore(h, day, idx) : '',
        this.__renderHeadWeekday(h, day),
        this.__renderHeadDayBtn(h, day),
        this.columnHeaderAfter === true ? this.__renderColumnHeaderAfter(h, day, idx) : '',
        slot ? slot(scope) : ''
      ])
    },

    __renderHeadWeekday (h, day) {
      const colorCurrent = day.current === true ? this.color : void 0

      let colors = new Map(), color, backgroundColor
      let updateColors = this.useDefaultTheme
      if (this.enableThemes === true) {
        if (day.past === true) {
          color = 'colorDayLabelPast'
          backgroundColor = 'backgroundDayLabelPast'
        } else if (day.current === true) {
          color = 'colorDayLabelCurrent'
          backgroundColor = 'backgroundDayLabelCurrent'
        } else if (day.future === true) {
          color = 'colorDayLabelFuture'
          backgroundColor = 'backgroundDayLabelFuture'
        }
        colors = this.getThemeColors([color, backgroundColor])
        updateColors = this.setBothColors
      }

      return h('div', updateColors(colorCurrent !== void 0 ? colorCurrent : colors.get(color), colors.get(backgroundColor), {
        staticClass: 'ellipsis q-calendar-scheduler__head-weekday'
      }), [
        this.__renderHeadDayLabel(h, day, this.shortWeekdayLabel)
      ])
    },

    __renderHeadDayLabel (h, day, label) {
      return h('span', {
        staticClass: 'ellipsis'
      }, this.weekdayFormatter(day, label))
    },

    __renderHeadDayBtn (h, day) {
      const colorCurrent = day.current === true ? this.color : void 0

      let colors = new Map(), color, backgroundColor
      let updateColors = this.useDefaultTheme
      if (this.enableThemes === true) {
        if (day.past === true) {
          color = 'colorDayLabelPast'
          backgroundColor = 'backgroundDayLabelPast'
        } else if (day.current === true) {
          color = 'colorDayLabelCurrent'
          backgroundColor = 'backgroundDayLabelCurrent'
        } else if (day.future === true) {
          color = 'colorDayLabelFuture'
          backgroundColor = 'backgroundDayLabelFuture'
        }
        colors = this.getThemeColors([color, backgroundColor])
        updateColors = this.setBothColors
      }

      return h('q-btn', updateColors(colorCurrent !== void 0 ? colorCurrent : colors.get(color), colors.get(backgroundColor), {
        staticClass: 'q-calendar-scheduler__head-day-label',
        style: {
          color: day.current === true ? colorCurrent : void 0
        },
        props: {
          unelevated: true,
          round: true,
          dense: true,
          noCaps: true,
          outline: day.current === true
        },
        on: this.getMouseEventHandlers({
          'click:date': { event: 'click', stop: true },
          'contextmenu:date': { event: 'contextmenu', stop: true, prevent: true, result: false }
        }, _event => day)
      }), this.dayFormatter(day, false))
    },

    __renderColumnHeaderBefore (h, day, idx) {
      const slot = this.$scopedSlots.schedulerColumnHeaderBefore
      let scope = { ...day }
      scope.index = idx
      return h('div', {
        staticClass: 'q-calendar-scheduler__column-header--before'
      }, [
        slot ? slot(scope) : ''
      ])
    },

    __renderColumnHeaderAfter (h, day, idx) {
      const slot = this.$scopedSlots.schedulerColumnHeaderAfter
      let scope = { ...day }
      scope.index = idx
      return h('div', {
        staticClass: 'q-calendar-scheduler__column-header--after'
      }, [
        slot ? slot(scope) : ''
      ])
    },

    __renderBody (h) {
      return h('div', {
        staticClass: 'q-calendar-scheduler__body'
      }, [
        this.__renderScrollArea(h)
      ])
    },

    __renderScrollArea (h) {
      if (this.noScroll !== void 0 && this.noScroll === true) {
        return this.__renderPane(h)
      } else {
        return h('div', {
          ref: 'scrollArea',
          staticClass: 'q-calendar-scheduler__scroll-area'
        }, [
          this.__renderPane(h)
        ])
      }
    },

    __renderPane (h) {
      return h('div', {
        ref: 'pane',
        staticClass: 'q-calendar-scheduler__pane',
        style: {
          height: convertToUnit(this.bodyHeight)
        }
      }, [
        this.__renderDayContainer(h)
      ])
    },

    __renderDayContainer (h) {
      return h('div', {
        staticClass: 'q-calendar-scheduler__day-container'
      }, [
        this.__renderBodyResources(h),
        ...this.__renderDays(h)
      ])
    },

    __renderDays (h) {
      if (this.days.length === 1 && this.columnCount && parseInt(this.columnCount) > 1) {
        return [...Array(parseInt(this.columnCount))]
          .map((_, i) => i + parseInt(this.columnIndexStart))
          .map((i) => this.__renderDay(h, this.days[0], 0, i))
      } else {
        return this.days.map((day, index) => this.__renderDay(h, day, index))
      }
    },

    __renderDay (h, day, idx) {
      const slot = this.$scopedSlots.schedulerDayBody
      const scope = this.getScopeForSlot(day, idx)

      let colors = new Map(), color, backgroundColor
      let updateColors = this.useDefaultTheme
      if (this.enableThemes === true) {
        if (day.past === true) {
          color = 'colorBodyPast'
          backgroundColor = 'backgroundBodyPast'
        } else if (day.current === true) {
          color = 'colorBodyCurrent'
          backgroundColor = 'backgroundBodyCurrent'
        } else if (day.future === true) {
          color = 'colorBodyFuture'
          backgroundColor = 'backgroundBodyFuture'
        }
        colors = this.getThemeColors([color, backgroundColor])
        updateColors = this.setBothColors
      }

      return h('div', updateColors(colors.get(color), colors.get(backgroundColor), {
        key: day.date + (idx !== void 0 ? `:${idx}` : ''),
        staticClass: 'q-calendar-scheduler__day',
        class: this.getRelativeClasses(day),
        on: this.getDefaultMouseEventHandlers(':time', e => {
          return this.getScopeForSlot(this.getTimestampAtEvent(e, day), idx)
        })
      }), [
        ...this.__renderDayResources(h, day, idx),
        slot ? slot(scope) : ''
      ])
    },

    __renderDayResources (h, day, idx) {
      return this.resources.map((resource) => this.__renderDayResource(h, resource, day, idx))
    },

    __renderDayResource (h, resource, day, idx) {
      const height = convertToUnit(this.intervalHeight)
      const styler = this.intervalStyle || this.intervalStyleDefault
      const slot = this.$scopedSlots.schedulerResource
      const scope = this.getScopeForSlot(day, idx, resource)
      let dragOver

      const data = {
        key: idx,
        staticClass: 'q-calendar-scheduler__day-resource',
        class: {
          'q-calendar-scheduler__day-resource--droppable': dragOver
        },
        style: {
          height,
          ...styler(resource)
        },
        domProps: {
          ondragover: (e) => {
            if (this.dragOverFunc !== void 0) {
              dragOver = this.dragOverFunc(e, resource, 'resource')
            }
          },
          ondrop: (e) => {
            if (this.dropFunc !== void 0) {
              this.dropFunc(e, resource, 'interval')
            }
          }
        }
      }

      const children = slot ? slot(scope) : void 0

      return h('div', data, children)
    },

    __renderBodyResources (h) {
      let colors = new Map(), color, backgroundColor
      let updateColors = this.useDefaultTheme
      if (this.enableThemes === true) {
        color = 'colorIntervalBody'
        backgroundColor = 'backgroundIntervalBody'
        colors = this.getThemeColors([color, backgroundColor])
        updateColors = this.setBothColors
      }

      const data = {
        staticClass: 'q-calendar-scheduler__resources-body',
        on: this.getDefaultMouseEventHandlers(':interval', e => {
          return this.getTimestampAtEvent(e, this.parsedStart)
        })
      }

      return h('div', updateColors(colors.get(color), colors.get(backgroundColor), data), this.__renderResourceLabels(h))
    },

    __renderResourceLabels (h) {
      return this.resources.map((resource) => this.__renderResourceLabel(h, resource))
    },

    __renderResourceLabel (h, resource) {
      const slot = this.$scopedSlots.schedulerResourcesInterval
      const scope = resource
      const height = convertToUnit(this.intervalHeight)
      const label = resource.label

      let colors = new Map(), color, backgroundColor
      let updateColors = this.useDefaultTheme
      if (this.enableThemes === true) {
        color = 'colorIntervalText'
        backgroundColor = 'backgroundIntervalText'
        colors = this.getThemeColors([color, backgroundColor])
        updateColors = this.setBothColors
      }

      return h('div', {
        key: resource.label,
        staticClass: 'q-calendar-scheduler__resource',
        style: {
          height
        }
      }, [
        slot ? slot(scope) : h('div', updateColors(colors.get(color), colors.get(backgroundColor), {
          staticClass: 'q-calendar-scheduler__resource-text'
        }), label)
      ])
    }
  },

  render (h) {
    return h('div', {
      class: this.classes,
      directives: [{
        modifiers: { quiet: true },
        name: 'resize',
        value: this.onResize
      }]
    }, [
      !this.hideHeader ? this.__renderHead(h) : '',
      this.__renderBody(h)
    ])
  }
})
