# D3.js 中国疫情可视化地图


一个`d3.js` 写的静态网页 数据从csv导入 

* 可以从深浅程度看出各地区在相应案例密度上的对比 鼠标停留在某地区会显示该地区当天的案例构成(由**饼状图**方式呈现) 右下角为具体案例数量

<img src="d3 Visualization/assets/img_confirmed.png" alt="image-20200902002303632" style="zoom:150%;" />






* 点击某一地区会将其放大并显示它改案例历史的**数量变**化 以及每天的**新增人数**

<img src="d3 Visualization/assets/img_zoomIn.png" alt="image-20200902002303632" style="zoom:150%;" />






* 当然如果切换到不同案例 **色系**也会随之改变 

<img src="d3 Visualization/assets/img_recovered.png" alt="image-20200902002303632" style="zoom:150%;" />

<img src="d3 Visualization/assets/img_zoomIn2.png" alt="image-20200902002303632" style="zoom:150%;" />






* 可以通过切换时间线来显示**不同时间**下的密度分布

<img src="d3 Visualization/assets/img_timeLine.png" alt="image-20200902002303632" style="zoom:150%;" />






* 显示当前时间下 **感染top10**城市对比

<img src="d3 Visualization/assets/img_comparision.png" alt="image-20200902002303632" style="zoom:150%;" />






* 动态表示前十地区感染人数的变化模式以及对比

<img src="d3 Visualization/assets/img_barChartRace.png" alt="image-20200902002303632" style="zoom:150%;" />