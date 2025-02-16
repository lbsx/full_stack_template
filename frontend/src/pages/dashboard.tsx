import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import {
    TooltipComponent,
    TooltipComponentOption,
    LegendComponent,
    LegendComponentOption
} from 'echarts/components';
import { GaugeChart, GaugeSeriesOption } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    TooltipComponent,
    LegendComponent,
    GaugeChart,
    CanvasRenderer,
    LabelLayout
]);

type EChartsOption = echarts.ComposeOption<
    TooltipComponentOption | LegendComponentOption | GaugeSeriesOption
>;

const Dashboard = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef<echarts.EChartsType | null>(null); // Ref to store chart instance
    // Assuming data is [error, success, left]
    const [data, setData] = useState([3, 23, 77, 0]);
    const error = data[0];
    const executed = data[1];
    const total = data[2]
    const isRunning = data[3] == 0;
    useEffect(() => {
        const chartDom = chartRef.current;
        const myChart = echarts.init(chartDom);
        chartInstance.current = myChart;

        return () => {
            myChart.dispose();
            chartInstance.current = null;
        };
    }, []); // total should be in dependency array
    useEffect(() => {
        if (!chartInstance.current) return;

        const option: EChartsOption = {
            legend: {
                top: '5%',
                left: 'left',
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    console.log(params.color);

                    if (params.seriesName === '运行状态') {
                        return `运行状态 <br/>
                                错误: ${error} (${(error / total * 100).toFixed(0)}%)<br/>
                                运行: ${executed} (${(executed / total * 100).toFixed(0)}%)<br/>
                                `;
                    }
                    return params.seriesName + " : " + params.value; // Fallback for other tooltips if needed
                }
            },
            
            series: [
                {
                    min: 0,
                    max: total,
                    axisLine: {
                        show: true,
                        lineStyle: {
                            width: 40,
                            shadowBlur: 0,
                            color: [
                                [error / total, 'red'],
                                [executed / total, "rgb(0, 148, 49)"], // Adjusted green stop
                                [1, 'gray']
                            ]
                        },
                        // roundCap: true 
                    },
                    name: '运行状态',
                    type: 'gauge',
                    
                    detail: {
                        // formatter: "{value}%",
                        offsetCenter: [0, "60%"],
                        valueAnimation: true,
                        formatter: (executed: number) => {
                            return `${(executed / total * 100).toFixed(0)}%`; // Format detail value as percentage
                        }
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        show: true,
                        rotate:1,
                        formatter: (value: number) => {
                            if (value === 0) {
                                return '0';
                            }
                            else if (value === total) {
                                return String(total);
                            }
                            return '';
                        },
                        color: '#333',
                        fontSize: 16,
                        distance: 20,
                    },
                    splitLine: {
                        show: false
                    },
                    
                    pointer: { // Style the pointer
                        itemStyle: {
                            color: 'green' // Pointer color
                        },

                    },
                    // animation: false,
                    animationEasingUpdate: 'quadraticIn', // Easing function for animation
                    data: [{
                        value: executed, // 指针指向 成功 + left 的总和的百分比
                        name: isRunning ? '运行中' : '即将停止'
                    }]
                }]
        };
        chartInstance.current.setOption(option);
    }, [data]);
    const updateData = () => {
        setData([error + 1, executed + Math.floor(Math.random() * 10), total, Math.floor(Math.random() * 2)]);
    };

    return (
        <div className="echarts-container">
            <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
            <p>{`${data}`}</p>
            <button onClick={updateData}>更新数据</button>
        </div>
    );
};

export default Dashboard;