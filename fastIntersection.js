const DB = {
    "Z1": [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 77n, 99n, 100n, 105n],
    "Z2": [7n, 8n, 9n, 10n, 12n, 18n, 19n, 20n, 21n, 77n, 88n, 99n, 100n, 105n, 109n, 116n, 200n],
    "Z3": [7n, 9n, 10n, 11n, 12n, 13n, 14n, 15n, 16n, 17n, 18n, 19n, 20n, 21n, 77n, 88n, 99n, 100n, 101n, 102n, 103n, 105n],
    "Z4": [2n, 3n, 5n, 7n, 9n, 13n, 14n, 15n, 16n, 17n, 18n],
    "Z5": [1n, 2n],
}
/*
tags: 查询标签
desc: 是否倒序
from: 哪个时间戳开始
once: 数据库每次取出
loop: 数据库循环上限（-1无限次）
need: 达成数据量中止（-1不限制）
注意：非精准限制，实际取出量可能超出need。
*/
function fastIntersection(tags, desc, from, once, loop, need, wipe = function (pre) { return pre; }) {
    if (tags.length === 0 || once <= 0) { return { "res": [], "end": 0n }; }
    // 输出三项：交集结果，进度时间戳，进度缓存（仅在内部循环中）
    const res = [];
    const val = {};
    while (loop !== 0) { // 正循环减至0时停止 负循环无限减少
        console.log("==================================================");
        console.log("---------------------- From ----------------------");
        console.log(from);
        console.log("---------------------- Last ----------------------");
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
        let remain = tags.length;
        for (const tag of tags) {
            if (!val[tag] || !val[tag].length) { // 缓存为空
                val[tag] = desc
                    ? DB[tag]
                        .reverse()
                        .filter(el => (from === 0n) ? true : (val[tag] ? (el < from) : (el <= from)))
                        .sort((a, b) => (a > b) ? -1 : ((a < b) ? 1 : 0))
                        .slice(0, once)
                    : DB[tag]
                        .filter(el => (from === 0n) ? true : (val[tag] ? (el > from) : (el >= from)))
                        .sort((a, b) => (a < b) ? -1 : ((a > b) ? 1 : 0))
                        .slice(0, once)
                    ;
            }
            else if (val[tag].length !== once) { // 缓存补充
                val[tag].push(...desc
                    ? DB[tag]
                        .reverse()
                        .filter(el => el < val[tag][val[tag].length - 1])
                        .sort((a, b) => (a > b) ? -1 : ((a < b) ? 1 : 0))
                        .slice(0, once - val[tag].length)
                    : DB[tag]
                        .filter(el => el > val[tag][val[tag].length - 1])
                        .sort((a, b) => (a < b) ? -1 : ((a > b) ? 1 : 0))
                        .slice(0, once - val[tag].length)
                );
            } // 已有足量数据就不查了
            if (val[tag].length === 0) { return { "res": res, "end": from }; } // 任何 len 为 0 则返回空结果，停止轮询。
            if (val[tag].length < once) { remain--; if (remain === 0) { loop = 0; }; } // 标签组全部读完后停止轮询
            if (desc) { // 上面已经判断 length 非空
                max[tag] = val[tag][0];
                min[tag] = val[tag][val[tag].length - 1];
            }
            else { // 上面已经判断 length 非空
                min[tag] = val[tag][0];
                max[tag] = val[tag][val[tag].length - 1];
            }
            if (minMax === 0n || min[tag] > minMax) { minMax = min[tag]; } // 找到 min 中的最大值，作为后续比对依据。
            if (maxMin === 0n || max[tag] < maxMin) { maxMin = max[tag]; } // 找到 max 中的最小值，作为查询进度输出。
            pin[tag] = 0; // 初始化指针
        }
        from = desc ? minMax : maxMin; // 下次查询起点（>非>=）
        console.log("---------------------- Pick ----------------------");
        console.log(val);
        const pre = [];
        let run = desc ? (maxMin >= minMax) : (minMax <= maxMin); // 如果某个标签 min 大于 maxMin ，则跳过本次查找。
        while (run) { // 双指针查询对象交集
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
                pre.push(jarMin);
                hit = true;
            }
            for (const tag in pin) {
                if (hit || (jar[tag] === (desc ? jarMax : jarMin))) { pin[tag]++; }
                if (pin[tag] === val[tag].length) { // 超出数组长度
                    run = false;
                    if (loop === 0) { continue; } // 若不再循环则不继续操作缓存
                    val[tag] = [];
                    pin[tag] = -1;
                }
                else if (desc ? (val[tag][pin[tag]] < minMax) : (val[tag][pin[tag]] > maxMin)) { // 超出查询尾数
                    run = false;
                    if (loop === 0) { continue; } // 若不再循环则不继续操作缓存
                    val[tag] = val[tag].slice(pin[tag]);
                    pin[tag] = -1;
                }
            }
        }
        res.push(...wipe(pre)); // 此处加入过滤方法，检查是否存在排除
        if (need >= 0 && res.length >= need) { loop = 0; } // 达成需求量则停止循环
        if (loop === 0) { continue; } // 若不再循环则不继续操作缓存
        for (const tag in pin) {
            // 已缓存或某个标签 min 大于 maxMin，则 val 保留全部数据（下次直接不用查了）
            if (pin[tag] < 0 || (desc ? (max[tag] < minMax) : (min[tag] > maxMin))) { continue; }
            // 用二分法求剩余数组 之前是直接清空 val[tag] = [];
            let bsl = pin[tag];
            let bsr = val[tag].length - 1;
            while (bsl <= bsr) {
                const mid = Math.floor((bsl + bsr) / 2);
                if (desc ? (val[tag][mid] < minMax) : (val[tag][mid] > maxMin)) { bsr = mid - 1; }
                else { bsl = mid + 1; } // 若超出数组长度 由slice返回空数组
            }
            val[tag] = val[tag].slice(bsl);
        }
    }
    console.log("==================================================");
    return { "res": res, "end": from };
}
console.log(fastIntersection(["Z1", "Z2", "Z3"], false, 0n, 3, 5, 10));
// console.log(fastIntersection(["Z1", "Z2", "Z3"], true, 0n, 3, 99, 4));
// console.log(fastIntersection(["Z1", "Z2", "Z3"], false, 0n, 3, 99, 4, function (pre) { return pre.filter(n => n != 77n); }));
