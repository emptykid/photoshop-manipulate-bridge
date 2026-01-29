# JSX 文件执行指南

## 概述

`/execute` 接口现在支持通过 `file` 参数读取并执行本地 JSX 文件。

## HTTP API 使用

### 基本语法

```bash
curl -X POST http://localhost:8020/execute \
  -H "Content-Type: application/json" \
  -d '{"file": "path/to/script.jsx"}'
```

### 路径类型

#### 1. 绝对路径
```bash
curl -X POST http://localhost:8020/execute \
  -H "Content-Type: application/json" \
  -d '{"file": "/Users/username/scripts/my-script.jsx"}'
```

#### 2. 相对路径
相对于插件运行目录（通常是插件的根目录）：
```bash
curl -X POST http://localhost:8020/execute \
  -H "Content-Type: application/json" \
  -d '{"file": "examples/test.jsx"}'
```

### 响应格式

**成功响应：**
```json
{
  "success": true,
  "result": "Document created successfully with text layer",
  "timestamp": "2026-01-28T10:16:00.000Z"
}
```

**错误响应：**
```json
{
  "success": false,
  "error": "Failed to execute JSX file: ENOENT: no such file or directory",
  "timestamp": "2026-01-28T10:16:00.000Z"
}
```

## WebSocket API 使用

### 发送消息

```javascript
const ws = new WebSocket('ws://localhost:8020');

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'executeJSXFile',
    data: {
      file: '/path/to/script.jsx'
    }
  }));
};

ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log(response);
};
```

## JSX 文件示例

### 示例 1: 创建文档
```javascript
// create-document.jsx
var doc = app.documents.add(1920, 1080, 72, "My Document", NewDocumentMode.RGB);
"Document created: " + doc.name;
```

使用：
```bash
curl -X POST http://localhost:8020/execute \
  -H "Content-Type: application/json" \
  -d '{"file": "scripts/create-document.jsx"}'
```

### 示例 2: 导出图层
```javascript
// export-layers.jsx
var doc = app.activeDocument;
var layers = [];

for (var i = 0; i < doc.layers.length; i++) {
    layers.push({
        name: doc.layers[i].name,
        visible: doc.layers[i].visible,
        opacity: doc.layers[i].opacity
    });
}

JSON.stringify(layers);
```

### 示例 3: 批量处理
```javascript
// batch-process.jsx
try {
    var doc = app.activeDocument;
    
    // 调整画布大小
    doc.resizeCanvas(800, 600, AnchorPosition.MIDDLECENTER);
    
    // 应用滤镜
    doc.flatten();
    
    // 保存
    var saveFile = new File("~/Desktop/processed.jpg");
    var saveOptions = new JPEGSaveOptions();
    saveOptions.quality = 10;
    doc.saveAs(saveFile, saveOptions);
    
    "Batch processing completed";
} catch (e) {
    "Error: " + e.message;
}
```

## 编程语言示例

### Node.js
```javascript
const axios = require('axios');

async function executeJSXFile(filePath) {
  try {
    const response = await axios.post('http://localhost:8020/execute', {
      file: filePath
    });
    console.log('Result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// 使用
executeJSXFile('/path/to/script.jsx');
```

### Python
```python
import requests

def execute_jsx_file(file_path):
    url = 'http://localhost:8020/execute'
    payload = {'file': file_path}
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print('Result:', response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print('Error:', e)

# 使用
execute_jsx_file('/path/to/script.jsx')
```

### PHP
```php
<?php
function executeJSXFile($filePath) {
    $url = 'http://localhost:8020/execute';
    $data = json_encode(['file' => $filePath]);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($data)
    ]);
    
    $result = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($result, true);
}

// 使用
$result = executeJSXFile('/path/to/script.jsx');
print_r($result);
?>
```

## 最佳实践

### 1. 错误处理
在 JSX 文件中始终使用 try-catch：
```javascript
try {
    // 你的代码
    var result = doSomething();
    result; // 返回结果
} catch (e) {
    "Error: " + e.message;
}
```

### 2. 返回值
JSX 脚本的最后一个表达式会作为结果返回：
```javascript
var doc = app.activeDocument;
doc.name; // 这会作为结果返回
```

### 3. JSON 返回
如果需要返回结构化数据，使用 JSON：
```javascript
var data = {
    name: app.activeDocument.name,
    width: app.activeDocument.width,
    height: app.activeDocument.height
};
JSON.stringify(data);
```

### 4. 文件路径规范
- 使用绝对路径避免路径解析问题
- Windows 路径使用双反斜杠：`C:\\Users\\...`
- 或使用正斜杠：`C:/Users/...`

## 测试

运行提供的测试脚本：
```bash
./examples/execute-file-example.sh
```

或手动测试：
```bash
# 测试包含的示例文件
curl -X POST http://localhost:8020/execute \
  -H "Content-Type: application/json" \
  -d '{"file": "examples/test.jsx"}'
```

## 参数优先级

如果同时提供多个参数，执行顺序为：
1. `action: 'alert'` + `message` - 显示警告
2. `file` - 执行 JSX 文件
3. `script` - 执行内联 JSX 代码

示例：
```json
{
  "file": "script.jsx",
  "script": "alert('test');"
}
```
在这个例子中，会执行 `file` 参数指定的文件，忽略 `script`。
