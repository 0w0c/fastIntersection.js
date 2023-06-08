// 未完成 1.二分法查询 2.逆向查询
const DB = {
    "Z1": [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 77n, 99n],
    "Z2": [7n, 8n, 9n, 10n, 12n, 18n, 19n, 20n, 21n, 77n, 88n, 99n],
    "Z3": [7n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n, 17n, 18n, 19n, 20n, 21n, 77n, 88n, 99n],
    "Z4": [2n, 3n, 5n, 7n, 9n, 13n, 14n, 15n, 16n, 17n, 18n],
}
/*
tags: 查询标签
desc: 是否倒序
from: 哪个时间戳开始
once: 数据库每次取出
loop: 数据库循环上限（-1无限次）
need: 达成数据量中止（-1不限制）
*/
function fastIntersection(tags, desc, from, once, loop, need) {
    if (tags.length === 0) { return { "res": [], "end": 0n }; }
    // 输出三项：交集结果，进度时间戳，进度缓存（仅在内部循环中）
    const res = [];
    const val = {};
    while (loop !== 0) { // 正循环减至0时停止 负循环无限减少
        console.log("Loop");
        console.log(from);
        console.log('-------------------------');
        console.log(val);
        loop--;
        /* 对阵列进行一次循环
        1. 任何 val[tag].length 为 0 则返回空结果。
        2. 任何 val[tag].length 小于 once 则停止轮询。
        3. 找到 max 中的最小值，作为查询进度 maxMin 输出。
        4. 查到 maxMin 以后，如果后续某个标签 min 大于 maxMin，则停止轮询。
        5. 双向查询交集时，查询 maxMin 之前的数据就够了，后面的肯定没交集。
        */
        const min = {};
        const max = {};
        const pin = {};
        let minMax = 0n; // min 中的最大值
        let maxMin = 0n; // max 中的最小值
        for (const tag of tags) {
            if (!val[tag] || !val[tag].length) { // 缓存为空
                val[tag] = DB[tag].filter(el => el >= from).slice(0, once);
            } else if (val[tag].length !== once) { // 缓存补充（已有足量数据就不查了）
                console.log(tag + ':继续');
                val[tag].push(...DB[tag].filter(el => el >= from).slice(0, once - val[tag].length)); // 查询数量 = 每次查询数量 - 已有长度。
            }
            // 任何 len 为 0 则返回空结果，停止轮询。
            if (val[tag].length === 0) { return { "res": res, "end": from, "ver": "A" }; }
            // 任何 len 小于 once 则把 loop 清零，停止轮询。
            if (val[tag].length < once) { loop = 0; }
            min[tag] = val[tag][0]; //上面已经判断 length 非空因此省略 val[tag].length ? val[tag][0] : null;
            max[tag] = val[tag][val[tag].length - 1]; //上面已经判断len非空因此省略 val[tag].length ? val[tag][val[tag].length - 1] : null;
            // 找到 min 中的最大值，作为后续比对依据。
            if (minMax === 0n || min[tag] > minMax) { minMax = min[tag]; }
            // 找到 max 中的最小值，作为查询进度输出。
            if (maxMin === 0n || max[tag] < maxMin) { maxMin = max[tag]; }
            // 初始化指针
            pin[tag] = 0;
        }
        from = maxMin;
        console.log('-------------------------');
        console.log(val);
        console.log('=========================');
        // 如果某个标签 min 大于 maxMin ，则跳过本次查找。
        let run = (minMax <= maxMin);
        // 双指针查询对象交集
        while (run) {
            const jar = {};
            let jarMin = 0n;
            let jarMax = 0n;
            let hit = false;
            for (const tag in val) {
                jar[tag] = val[tag][pin[tag]];
                if (jarMin === 0n || jar[tag] < jarMin) { jarMin = jar[tag]; }
                if (jarMax === 0n || jar[tag] > jarMax) { jarMax = jar[tag]; }
            }
            if (jarMin === jarMax) {
                // 此处加入过滤方法，检查是否存在排除
                res.push(jarMin);
                if (need >= 0 && res.length >= need) { loop = 0; }
                hit = true;
            }
            for (const tag in pin) {
                if (hit || jar[tag] === jarMin) { pin[tag]++; }
                if (pin[tag] === val[tag].length) { // 超出数组长度
                    run = false;
                    if (loop === 0) { continue; } // ?
                    pin[tag] = -1;
                    val[tag] = [];
                }
                else if (val[tag][pin[tag]] > maxMin) { // 超出查询尾数 maxMin
                    run = false;
                    if (loop === 0) { continue; } // ?
                    pin[tag] = -1;
                    val[tag] = val[tag].slice(pin[tag]);
                }
            }
        }
        // 循环末尾，如果依旧有 loop 次数，则求缓存数据
        if (loop === 0) { continue; }
        for (const tag in pin) {
            // 已缓存或某个标签 min 大于 maxMin，则 val 保留全部数据（下次直接不用查了）
            if (pin[tag] < 0 || min[tag] > maxMin) { continue; }
            // 用二分法求剩余数组
            val[tag] = [];
        }
    }
    return { "res": res, "end": from, "ver": "B" };
}
console.log(fastIntersection(["Z1", "Z2", "Z3"], false, 0n, 5, 2, 10));
