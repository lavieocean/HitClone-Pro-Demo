#!/bin/bash

# 🎯 HitClone Pro 8081端口访问问题8层诊断脚本
# 基于o3 Pro建议的逐级定位清单

echo "🔍 HitClone Pro 8081端口访问问题诊断工具"
echo "=========================================="
echo "📅 执行时间: $(date)"
echo "🖥️  系统信息: $(uname -a)"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNING_TESTS=0

# 测试结果记录函数
log_test() {
    local status=$1
    local title=$2
    local message=$3
    local details=$4
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    case $status in
        "PASS")
            echo -e "${GREEN}✅ [$title] $message${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            ;;
        "FAIL")
            echo -e "${RED}❌ [$title] $message${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  [$title] $message${NC}"
            WARNING_TESTS=$((WARNING_TESTS + 1))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  [$title] $message${NC}"
            ;;
    esac
    
    if [ ! -z "$details" ]; then
        echo "   详情: $details"
    fi
    echo ""
}

echo "🚀 开始8层系统诊断..."
echo ""

# ==========================================
# 层级1: 进程-端口检查
# ==========================================
echo "🔍 层级1: 进程-端口检查"
echo "----------------------------------------"

# 检查8081端口监听状态
echo "检查端口8081监听状态..."
if command -v lsof >/dev/null 2>&1; then
    PORT_CHECK=$(lsof -i :8081 2>/dev/null)
    if [ ! -z "$PORT_CHECK" ]; then
        log_test "PASS" "端口监听" "8081端口正在被监听" "$PORT_CHECK"
    else
        log_test "FAIL" "端口监听" "8081端口未被监听" "运行 'node start-server-enhanced.js' 启动服务器"
    fi
else
    # 使用netstat作为备选
    PORT_CHECK=$(netstat -an 2>/dev/null | grep :8081)
    if [ ! -z "$PORT_CHECK" ]; then
        log_test "PASS" "端口监听" "8081端口正在被监听" "$PORT_CHECK"
    else
        log_test "FAIL" "端口监听" "8081端口未被监听" "运行 'node start-server-enhanced.js' 启动服务器"
    fi
fi

# 检查Node.js进程
echo "检查Node.js服务器进程..."
NODE_PROCESSES=$(ps aux | grep -E "node.*server|server.*js" | grep -v grep)
if [ ! -z "$NODE_PROCESSES" ]; then
    log_test "PASS" "Node.js进程" "发现Node.js服务器进程" "$NODE_PROCESSES"
else
    log_test "WARN" "Node.js进程" "未发现相关Node.js进程" "可能需要启动服务器"
fi

# ==========================================
# 层级2: loopback (IPv4/IPv6)
# ==========================================
echo "🌐 层级2: Loopback解析检查"
echo "----------------------------------------"

# 测试localhost解析
echo "测试localhost DNS解析..."
LOCALHOST_PING=$(ping -c 3 localhost 2>/dev/null | head -5)
if echo "$LOCALHOST_PING" | grep -q "127.0.0.1"; then
    log_test "PASS" "IPv4解析" "localhost正确解析到127.0.0.1" 
elif echo "$LOCALHOST_PING" | grep -q "::1"; then
    log_test "WARN" "IPv6解析" "localhost解析到IPv6地址" "建议在浏览器中使用 http://127.0.0.1:8081"
else
    log_test "FAIL" "DNS解析" "localhost解析失败" "$LOCALHOST_PING"
fi

# 测试各种地址的连通性
echo "测试网络连通性..."
for addr in "127.0.0.1:8081" "localhost:8081" "[::1]:8081"; do
    if command -v nc >/dev/null 2>&1; then
        if nc -z -G 2 ${addr/:/ } 2>/dev/null; then
            log_test "PASS" "连通性" "$addr 连接成功"
        else
            log_test "FAIL" "连通性" "$addr 连接失败"
        fi
    fi
done

# ==========================================
# 层级3: HTTP响应检查
# ==========================================
echo "🌐 层级3: HTTP响应检查"
echo "----------------------------------------"

# 测试HTTP响应
echo "测试HTTP响应..."
for url in "http://127.0.0.1:8081" "http://localhost:8081"; do
    HTTP_RESPONSE=$(curl -s -I -m 5 "$url" 2>/dev/null)
    if [ $? -eq 0 ] && echo "$HTTP_RESPONSE" | grep -q "HTTP/1.1 200"; then
        CONTENT_TYPE=$(echo "$HTTP_RESPONSE" | grep -i "content-type" | head -1)
        if echo "$CONTENT_TYPE" | grep -q "charset=utf-8"; then
            log_test "PASS" "HTTP响应" "$url 响应正常且包含UTF-8编码" "$CONTENT_TYPE"
        else
            log_test "WARN" "HTTP响应" "$url 响应正常但可能缺少UTF-8编码" "$CONTENT_TYPE"
        fi
    else
        log_test "FAIL" "HTTP响应" "$url 无响应或非200状态" 
    fi
done

# 测试健康检查端点
echo "测试健康检查端点..."
HEALTH_CHECK=$(curl -s -m 5 "http://localhost:8081/health" 2>/dev/null)
if [ $? -eq 0 ] && echo "$HEALTH_CHECK" | grep -q "healthy"; then
    log_test "PASS" "健康检查" "服务器健康检查正常" 
else
    log_test "FAIL" "健康检查" "健康检查端点无响应"
fi

# ==========================================
# 层级4: 内容检查
# ==========================================
echo "📄 层级4: 内容检查"
echo "----------------------------------------"

# 检查主页内容
echo "检查主页内容..."
HOMEPAGE_CONTENT=$(curl -s -m 5 "http://localhost:8081/" 2>/dev/null)
if [ $? -eq 0 ]; then
    if echo "$HOMEPAGE_CONTENT" | grep -q "HitClone"; then
        CONTENT_LENGTH=${#HOMEPAGE_CONTENT}
        log_test "PASS" "主页内容" "主页包含HitClone标识" "内容长度: $CONTENT_LENGTH 字符"
    else
        log_test "WARN" "主页内容" "主页内容异常，可能存在乱码" "请检查UTF-8编码设置"
    fi
else
    log_test "FAIL" "主页内容" "无法获取主页内容"
fi

# 检查关键静态资源
echo "检查关键静态资源..."
for resource in "/src/main.jsx" "/src/index.css" "/vite.svg"; do
    RESOURCE_RESPONSE=$(curl -s -I -m 5 "http://localhost:8081$resource" 2>/dev/null)
    if [ $? -eq 0 ] && echo "$RESOURCE_RESPONSE" | grep -q "200 OK"; then
        MIME_TYPE=$(echo "$RESOURCE_RESPONSE" | grep -i "content-type" | head -1)
        log_test "PASS" "静态资源" "$resource 可访问" "$MIME_TYPE"
    else
        log_test "FAIL" "静态资源" "$resource 无法访问"
    fi
done

# ==========================================
# 层级5: 系统防火墙检查
# ==========================================
echo "🔥 层级5: 系统防火墙检查"
echo "----------------------------------------"

# macOS防火墙检查
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "检查macOS防火墙状态..."
    FIREWALL_STATUS=$(sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null)
    if echo "$FIREWALL_STATUS" | grep -q "enabled"; then
        log_test "WARN" "macOS防火墙" "防火墙已启用，可能阻止连接" "建议临时关闭或添加Node.js到允许列表"
    else
        log_test "PASS" "macOS防火墙" "防火墙已关闭或允许连接"
    fi
    
    # 检查Little Snitch等网络监控软件
    if pgrep -f "Little Snitch" >/dev/null; then
        log_test "WARN" "网络监控" "检测到Little Snitch运行" "请检查其是否阻止Node.js网络访问"
    fi
fi

# ==========================================
# 层级6: 浏览器诊断
# ==========================================
echo "🌐 层级6: 浏览器相关检查"
echo "----------------------------------------"

# 检查诊断工具可用性
BROWSER_DIAGNOSTIC=$(curl -s -m 5 "http://localhost:8081/debug/browser.html" 2>/dev/null)
if [ $? -eq 0 ] && echo "$BROWSER_DIAGNOSTIC" | grep -q "浏览器调试"; then
    log_test "PASS" "浏览器诊断工具" "增强版诊断工具可用" "访问 http://localhost:8081/debug/browser.html"
else
    log_test "FAIL" "浏览器诊断工具" "诊断工具不可用"
fi

# ==========================================
# 层级7: 端口冲突检查
# ==========================================
echo "🔌 层级7: 端口冲突检查"
echo "----------------------------------------"

# 检查可能的端口冲突
echo "检查端口使用情况..."
for port in 8080 8081 8082 8083 3000; do
    if command -v lsof >/dev/null 2>&1; then
        PORT_USAGE=$(lsof -i :$port 2>/dev/null)
        if [ ! -z "$PORT_USAGE" ]; then
            PROCESS_INFO=$(echo "$PORT_USAGE" | awk 'NR==2{print $1, $2}')
            if [ "$port" = "8081" ]; then
                log_test "PASS" "端口$port" "正在使用中" "$PROCESS_INFO"
            else
                log_test "INFO" "端口$port" "被其他进程占用" "$PROCESS_INFO"
            fi
        else
            if [ "$port" = "8081" ]; then
                log_test "FAIL" "端口$port" "未被使用" "需要启动HitClone Pro服务器"
            else
                log_test "INFO" "端口$port" "可用"
            fi
        fi
    fi
done

# ==========================================
# 层级8: 验证建议
# ==========================================
echo "💡 层级8: 解决方案建议"
echo "----------------------------------------"

# 生成最小复现验证
echo "生成最小复现验证..."
MINIMAL_TEST_FILE="/tmp/hitclone_test.html"
curl -s -m 5 "http://127.0.0.1:8081/" > "$MINIMAL_TEST_FILE" 2>/dev/null
if [ -f "$MINIMAL_TEST_FILE" ] && [ -s "$MINIMAL_TEST_FILE" ]; then
    log_test "PASS" "最小复现" "页面内容已保存到 $MINIMAL_TEST_FILE" "可用浏览器打开查看"
    echo "   运行: open $MINIMAL_TEST_FILE  # macOS"
    echo "   如果本地文件正常显示而浏览器直接访问不行，问题在浏览器链路"
else
    log_test "FAIL" "最小复现" "无法保存页面内容到本地文件"
fi

# ==========================================
# 总结报告
# ==========================================
echo ""
echo "📊 诊断总结报告"
echo "=========================================="
echo "📋 测试统计:"
echo "   总测试数: $TOTAL_TESTS"
echo "   通过: $PASSED_TESTS"
echo "   失败: $FAILED_TESTS" 
echo "   警告: $WARNING_TESTS"

SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo "   成功率: $SUCCESS_RATE%"
echo ""

if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}🚨 发现问题，建议按以下顺序解决:${NC}"
    echo "1. 确保服务器已启动: node start-server-enhanced.js"
    echo "2. 使用直接IP访问: http://127.0.0.1:8081"
    echo "3. 清除浏览器缓存和Service Worker"
    echo "4. 尝试无痕模式或其他浏览器"
    echo "5. 检查防火墙和安全软件设置"
    echo "6. 使用浏览器诊断工具: http://localhost:8081/debug/browser.html"
elif [ $WARNING_TESTS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  存在潜在问题，建议优化:${NC}"
    echo "1. 检查IPv6解析设置"
    echo "2. 确认防火墙配置"
    echo "3. 验证UTF-8编码设置"
else
    echo -e "${GREEN}🎉 所有检查通过！服务器应该可以正常访问${NC}"
    echo "🌐 访问地址: http://localhost:8081"
    echo "🔧 诊断工具: http://localhost:8081/debug/browser.html"
fi

echo ""
echo "🔄 如问题仍然存在，请:"
echo "1. 运行浏览器诊断工具获取详细信息"
echo "2. 检查浏览器开发者工具的Console和Network面板"
echo "3. 尝试不同的浏览器和网络环境"
echo ""
echo "📅 诊断完成时间: $(date)"