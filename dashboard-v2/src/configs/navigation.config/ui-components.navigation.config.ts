import { UI_COMPONENTS_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const uiComponentNavigationConfig: NavigationTree[] = [
    {
        key: 'uiComponent',
        path: '',
        title: 'کامپوننت‌های UI',
        translateKey: 'nav.uiComponents',
        icon: 'uiComponents',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        meta: {
            horizontalMenu: {
                layout: 'tabs',
                columns: 2,
            },
        },
        subMenu: [
            {
                key: 'uiComponent.common',
                path: '',
                title: 'عمومی',
                translateKey: 'nav.uiComponentsCommon.common',
                icon: 'common',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.uiComponentsCommon.commonDesc',
                        label: 'عناصر عمومی UI',
                    },
                },
                subMenu: [
                    {
                        key: 'uiComponent.common.button',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/button`,
                        title: 'دکمه',
                        translateKey: 'nav.uiComponentsCommon.button',
                        icon: 'uiCommonButton',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsCommon.buttonDesc',
                                label: 'دکمه‌های تعاملی',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.common.grid',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/grid`,
                        title: 'شبکه‌بندی',
                        translateKey: 'nav.uiComponentsCommon.grid',
                        icon: 'uiCommonGrid',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsCommon.gridDesc',
                                label: 'سیستم شبکه‌بندی',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.common.typography',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/typography`,
                        title: 'تایپوگرافی',
                        translateKey: 'nav.uiComponentsCommon.typography',
                        icon: 'uiCommonTypography',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsCommon.typographyDesc',
                                label: 'ابزارهای استایل متن',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.common.icons',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/icons`,
                        title: 'آیکون‌ها',
                        translateKey: 'nav.uiComponentsCommon.icons',
                        icon: 'uiCommonIcons',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsCommon.iconsDesc',
                                label: 'مجموعه آیکون‌ها',
                            },
                        },
                        subMenu: [],
                    },
                ],
            },
            {
                key: 'uiComponent.feedback',
                path: '',
                title: 'بازخورد',
                translateKey: 'nav.uiComponentsFeedback.feedback',
                icon: 'feedback',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.uiComponentsFeedback.feedbackDesc',
                        label: 'کامپوننت‌های بازخورد کاربر',
                    },
                },
                subMenu: [
                    {
                        key: 'uiComponent.feedback.alert',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/alert`,
                        title: 'هشدار',
                        translateKey: 'nav.uiComponentsFeedback.alert',
                        icon: 'uiFeedbackAlert',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsFeedback.alertDesc',
                                label: 'هشدارهای اطلاع‌رسانی',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.feedback.dialog',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/dialog`,
                        title: 'دیالوگ',
                        translateKey: 'nav.uiComponentsFeedback.dialog',
                        icon: 'uiFeedbackDialog',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsFeedback.dialogDesc',
                                label: 'جعبه‌های گفتگوی مدال',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.feedback.drawer',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/drawer`,
                        title: 'کشو',
                        translateKey: 'nav.uiComponentsFeedback.drawer',
                        icon: 'uiFeedbackDrawer',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsFeedback.drawerDesc',
                                label: 'کشوهای جانبی',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.feedback.progress',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/progress`,
                        title: 'پیشرفت',
                        translateKey: 'nav.uiComponentsFeedback.progress',
                        icon: 'uiFeedbackProgress',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsFeedback.progressDesc',
                                label: 'شاخص‌های پیشرفت',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.feedback.skeleton',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/skeleton`,
                        title: 'اسکلت',
                        translateKey: 'nav.uiComponentsFeedback.skeleton',
                        icon: 'uiFeedbackSkeleton',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsFeedback.skeletonDesc',
                                label: 'اسکلت‌های بارگذاری',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.feedback.spinner',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/spinner`,
                        title: 'چرخنده',
                        translateKey: 'nav.uiComponentsFeedback.spinner',
                        icon: 'uiFeedbackSpinner',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsFeedback.spinnerDesc',
                                label: 'چرخنده‌های بارگذاری',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.feedback.toast',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/toast`,
                        title: 'پیام سریع',
                        translateKey: 'nav.uiComponentsFeedback.toast',
                        icon: 'uiFeedbackToast',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsFeedback.toastDesc',
                                label: 'پیام‌های سریع',
                            },
                        },
                        subMenu: [],
                    },
                ],
            },
            {
                key: 'uiComponent.dataDisplay',
                path: '',
                title: 'نمایش داده‌ها',
                translateKey: 'nav.uiComponentsDataDisplay.dataDisplay',
                icon: 'dataDisplay',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                meta: {
                  description: {
                    translateKey: 'nav.uiComponentsDataDisplay.dataDisplayDesc',
                    label: 'کامپوننت‌ها برای نمایش داده‌ها',
                  },
                },
                subMenu: [
                  {
                    key: 'uiComponent.dataDisplay.avatar',
                    path: `${UI_COMPONENTS_PREFIX_PATH}/avatar`,
                    title: 'آواتار',
                    translateKey: 'nav.uiComponentsDataDisplay.avatar',
                    icon: 'uiDataDisplayAvatar',
                    type: NAV_ITEM_TYPE_ITEM,
                    authority: [ADMIN, USER],
                    meta: {
                      description: {
                        translateKey: 'nav.uiComponentsDataDisplay.avatarDesc',
                        label: 'تصاویر پروفایل کاربران',
                      },
                    },
                    subMenu: [],
                  },
                  {
                    key: 'uiComponent.dataDisplay.badge',
                    path: `${UI_COMPONENTS_PREFIX_PATH}/badge`,
                    title: 'نشان',
                    translateKey: 'nav.uiComponentsDataDisplay.badge',
                    icon: 'uiDataDisplayBadge',
                    type: NAV_ITEM_TYPE_ITEM,
                    authority: [ADMIN, USER],
                    meta: {
                      description: {
                        translateKey: 'nav.uiComponentsDataDisplay.badgeDesc',
                        label: 'شاخص‌های وضعیت',
                      },
                    },
                    subMenu: [],
                  },
                  {
                    key: 'uiComponent.dataDisplay.calendar',
                    path: `${UI_COMPONENTS_PREFIX_PATH}/calendar`,
                    title: 'تقویم',
                    translateKey: 'nav.uiComponentsDataDisplay.calendar',
                    icon: 'uiDataDisplayCalendar',
                    type: NAV_ITEM_TYPE_ITEM,
                    authority: [ADMIN, USER],
                    meta: {
                      description: {
                        translateKey: 'nav.uiComponentsDataDisplay.calendarDesc',
                        label: 'انتخاب‌کننده‌های تاریخ',
                      },
                    },
                    subMenu: [],
                  },
                  {
                    key: 'uiComponent.dataDisplay.cards',
                    path: `${UI_COMPONENTS_PREFIX_PATH}/cards`,
                    title: 'کارت‌ها',
                    translateKey: 'nav.uiComponentsDataDisplay.cards',
                    icon: 'uiDataDisplayCard',
                    type: NAV_ITEM_TYPE_ITEM,
                    authority: [ADMIN, USER],
                    meta: {
                      description: {
                        translateKey: 'nav.uiComponentsDataDisplay.cardsDesc',
                        label: 'کارت‌های محتوا',
                      },
                    },
                    subMenu: [],
                  },
                  {
                    key: 'uiComponent.dataDisplay.table',
                    path: `${UI_COMPONENTS_PREFIX_PATH}/table`,
                    title: 'جدول',
                    translateKey: 'nav.uiComponentsDataDisplay.table',
                    icon: 'uiDataDisplayTable',
                    type: NAV_ITEM_TYPE_ITEM,
                    authority: [ADMIN, USER],
                    meta: {
                      description: {
                        translateKey: 'nav.uiComponentsDataDisplay.tableDesc',
                        label: 'جدول‌های داده',
                      },
                    },
                    subMenu: [],
                  },
                  {
                    key: 'uiComponent.dataDisplay.tag',
                    path: `${UI_COMPONENTS_PREFIX_PATH}/tag`,
                    title: 'برچسب',
                    translateKey: 'nav.uiComponentsDataDisplay.tag',
                    icon: 'uiDataDisplayTag',
                    type: NAV_ITEM_TYPE_ITEM,
                    authority: [ADMIN, USER],
                    meta: {
                      description: {
                        translateKey: 'nav.uiComponentsDataDisplay.tagDesc',
                        label: 'برچسب‌های برچسب‌گذاری',
                      },
                    },
                    subMenu: [],
                  },
                  {
                    key: 'uiComponent.dataDisplay.timeline',
                    path: `${UI_COMPONENTS_PREFIX_PATH}/timeline`,
                    title: 'خط زمانی',
                    translateKey: 'nav.uiComponentsDataDisplay.timeline',
                    icon: 'uiDataDisplayTimeline',
                    type: NAV_ITEM_TYPE_ITEM,
                    authority: [ADMIN, USER],
                    meta: {
                      description: {
                        translateKey: 'nav.uiComponentsDataDisplay.timelineDesc',
                        label: 'خطوط زمانی رویدادها',
                      },
                    },
                    subMenu: [],
                  },
                  {
                    key: 'uiComponent.dataDisplay.tooltip',
                    path: `${UI_COMPONENTS_PREFIX_PATH}/tooltip`,
                    title: 'راهنمای ابزار',
                    translateKey: 'nav.uiComponentsDataDisplay.tooltip',
                    icon: 'uiDataDisplayTooltip',
                    type: NAV_ITEM_TYPE_ITEM,
                    authority: [ADMIN, USER],
                    meta: {
                      description: {
                        translateKey: 'nav.uiComponentsDataDisplay.tooltipDesc',
                        label: 'راهنمای ابزار هنگام حرکت موس',
                      },
                    },
                    subMenu: [],
                  },
                ],
              },
              
              {
                key: 'uiComponent.forms',
                path: '',
                title: 'فرم‌ها',
                translateKey: 'nav.uiComponentsForms.forms',
                icon: 'forms',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.uiComponentsForms.formsDesc',
                        label: 'عناصر فرم',
                    },
                },
                subMenu: [
                    {
                        key: 'uiComponent.forms.checkbox',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/checkbox`,
                        title: 'چک‌باکس',
                        translateKey: 'nav.uiComponentsForms.checkbox',
                        icon: 'uiFormsCheckbox',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsForms.checkboxDesc',
                                label: 'چک‌باکس‌های قابل علامت‌گذاری',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.datePicker',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/date-picker`,
                        title: 'انتخاب تاریخ',
                        translateKey: 'nav.uiComponentsForms.datePicker',
                        icon: 'uiFormsDatepicker',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsForms.datePickerDesc',
                                label: 'انتخاب تاریخ‌ها',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.formControl',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/form-control`,
                        title: 'کنترل فرم',
                        translateKey: 'nav.uiComponentsForms.formControl',
                        icon: 'uiFormsFormControl',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsForms.formControlDesc',
                                label: 'عناصر کنترل فرم',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.input',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/input`,
                        title: 'ورودی',
                        translateKey: 'nav.uiComponentsForms.input',
                        icon: 'uiFormsInput',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsForms.inputDesc',
                                label: 'ورودی‌های متنی',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.inputGroup',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/input-group`,
                        title: 'گروه ورودی',
                        translateKey: 'nav.uiComponentsForms.inputGroup',
                        icon: 'uiFormsInputGroup',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsForms.inputGroupDesc',
                                label: 'ورودی‌های گروه‌بندی شده',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.radio',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/radio`,
                        title: 'رادیو',
                        translateKey: 'nav.uiComponentsForms.radio',
                        icon: 'uiFormsRadio',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsForms.radioDesc',
                                label: 'دکمه‌های رادیویی',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.segment',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/segment`,
                        title: 'بخش',
                        translateKey: 'nav.uiComponentsForms.segment',
                        icon: 'uiFormsSegment',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsForms.segmentDesc',
                                label: 'بخش‌های ورودی',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.select',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/select`,
                        title: 'انتخاب',
                        translateKey: 'nav.uiComponentsForms.select',
                        icon: 'uiFormsSelect',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsForms.selectDesc',
                                label: 'انتخاب‌های کشویی',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.switcher',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/switcher`,
                        title: 'سوئیچ',
                        translateKey: 'nav.uiComponentsForms.switcher',
                        icon: 'uiFormsSwitcher',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsForms.switcherDesc',
                                label: 'سوئیچ‌های تنظیمی',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.timeInput',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/time-input`,
                        title: 'ورودی زمان',
                        translateKey: 'nav.uiComponentsForms.timeInput',
                        icon: 'uiFormsTimePicker',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsForms.timeInputDesc',
                                label: 'ورودی‌های زمان',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.forms.upload',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/upload`,
                        title: 'بارگذاری',
                        translateKey: 'nav.uiComponentsForms.upload',
                        icon: 'uiFormsUpload',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsForms.uploadDesc',
                                label: 'بارگذاری فایل‌ها',
                            },
                        },
                        subMenu: [],
                    },
                ],
            },
            
            {
                key: 'uiComponent.navigation',
                path: '',
                title: 'ناوبری',
                translateKey: 'nav.uiComponentsNavigation.navigation',
                icon: 'navigation',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.uiComponentsNavigation.navigationDesc',
                        label: 'عناصر ناوبری',
                    },
                },
                subMenu: [
                    {
                        key: 'uiComponent.navigation.dropdown',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/dropdown`,
                        title: 'منوی کشویی',
                        translateKey: 'nav.uiComponentsNavigation.dropdown',
                        icon: 'uiNavigationDropdown',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsNavigation.dropdownDesc',
                                label: 'منوهای کشویی',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.navigation.menu',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/menu`,
                        title: 'منو',
                        translateKey: 'nav.uiComponentsNavigation.menu',
                        icon: 'uiNavigationMenu',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsNavigation.menuDesc',
                                label: 'ناوبری منو',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.navigation.pagination',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/pagination`,
                        title: 'صفحه‌بندی',
                        translateKey: 'nav.uiComponentsNavigation.pagination',
                        icon: 'uiNavigationPagination',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsNavigation.paginationDesc',
                                label: 'کنترل‌های صفحه‌بندی',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.navigation.steps',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/steps`,
                        title: 'مراحل',
                        translateKey: 'nav.uiComponentsNavigation.steps',
                        icon: 'uiNavigationSteps',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsNavigation.stepsDesc',
                                label: 'مراحل متوالی',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.navigation.tabs',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/tabs`,
                        title: 'برگه‌ها',
                        translateKey: 'nav.uiComponentsNavigation.tabs',
                        icon: 'uiNavigationTabs',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsNavigation.tabsDesc',
                                label: 'ناوبری برگه‌ها',
                            },
                        },
                        subMenu: [],
                    },
                ],
            },
            
            {
                key: 'uiComponent.graph',
                path: '',
                title: 'نمودار',
                translateKey: 'nav.uiComponentsGraph.graph',
                icon: 'graph',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.uiComponentsGraph.graphDesc',
                        label: 'عناصر گرافیکی',
                    },
                },
                subMenu: [
                    {
                        key: 'uiComponent.graph.charts',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/graph/charts`,
                        title: 'نمودارها',
                        translateKey: 'nav.uiComponentsGraph.charts',
                        icon: 'uiGraphChart',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsGraph.chartsDesc',
                                label: 'نمودارهای مختلف',
                            },
                        },
                        subMenu: [],
                    },
                    {
                        key: 'uiComponent.graph.maps',
                        path: `${UI_COMPONENTS_PREFIX_PATH}/graph/maps`,
                        title: 'نقشه‌ها',
                        translateKey: 'nav.uiComponentsGraph.maps',
                        icon: 'uiGraphMaps',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.uiComponentsGraph.mapsDesc',
                                label: 'نقشه‌های جغرافیایی',
                            },
                        },
                        subMenu: [],
                    },
                ],
            },
            
        ],
    },
]

export default uiComponentNavigationConfig
