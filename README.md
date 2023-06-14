# fastIntersection.js
Multiple array intersection using pointers and binary search

【开源的理由】  
代码由文科生编写，质量完全没有保证。  
开源可以让各路大佬审阅，找到问题并提出优化建议。  

【用途和流程】  
同时查询多个标签，取出固定数量的顺序数组，找到其中的交集部分。  
可指定查询起始点、单次查询数量、查询次数上限、交集需求量。  
基本流程详见代码注释。  

【已查询剩余部分缓存】  
已遍历的数组，如果有剩余查询次数，则对下次索引起始点后的部分进行缓存。  
此举目的是减少数据库读取的列表长度，甚至完全不独去，以减少IO请求次数。  

【使用二分法查询下次起始点】  
若不确定某数组中下次起始点的位置，则使用二分法进行查询。    
实验表明 binary search + slice 性能明显高于 liner search + push ：  
https://measurethat.net/Benchmarks/Show/7075/0/array-slice-vs-for-loop  
