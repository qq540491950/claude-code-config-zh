/**
 * 跨平台工具函数 - Claude Code 钩子和脚本
 * 支持 Windows、macOS 和 Linux
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawnSync } = require('child_process');

// 平台检测
const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

/**
 * 获取用户主目录（跨平台）
 */
function getHomeDir() {
  return os.homedir();
}

/**
 * 获取 Claude 配置目录
 */
function getClaudeDir() {
  return path.join(getHomeDir(), '.claude');
}

/**
 * 获取会话目录
 */
function getSessionsDir() {
  return path.join(getClaudeDir(), 'sessions');
}

/**
 * 获取学习到的技能目录
 */
function getLearnedSkillsDir() {
  return path.join(getClaudeDir(), 'skills', 'learned');
}

/**
 * 获取临时目录（跨平台）
 */
function getTempDir() {
  return os.tmpdir();
}

/**
 * 确保目录存在（不存在则创建）
 * @param {string} dirPath - 要创建的目录路径
 * @returns {string} 目录路径
 * @throws {Error} 如果无法创建目录（如权限不足）
 */
function ensureDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw new Error(`创建目录失败 '${dirPath}': ${err.message}`);
    }
  }
  return dirPath;
}

/**
 * 获取当前日期（YYYY-MM-DD 格式）
 */
function getDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取当前时间（HH:MM 格式）
 */
function getTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 获取 git 仓库名称
 */
function getGitRepoName() {
  const result = runCommand('git rev-parse --show-toplevel');
  if (!result.success) return null;
  return path.basename(result.output);
}

/**
 * 从 git 仓库或当前目录获取项目名称
 */
function getProjectName() {
  const repoName = getGitRepoName();
  if (repoName) return repoName;
  return path.basename(process.cwd()) || null;
}

/**
 * 从 CLAUDE_SESSION_ID 环境变量获取短会话 ID
 * 返回最后 8 个字符，回退到项目名然后是 'default'
 */
function getSessionIdShort(fallback = 'default') {
  const sessionId = process.env.CLAUDE_SESSION_ID;
  if (sessionId && sessionId.length > 0) {
    return sessionId.slice(-8);
  }
  return getProjectName() || fallback;
}

/**
 * 获取当前日期时间（YYYY-MM-DD HH:MM:SS 格式）
 */
function getDateTimeString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 在目录中查找匹配模式的文件（跨平台 find 替代方案）
 * @param {string} dir - 要搜索的目录
 * @param {string} pattern - 文件模式（如 "*.tmp"、"*.md"）
 * @param {object} options - 选项 { maxAge: 天数, recursive: 布尔值 }
 */
function findFiles(dir, pattern, options = {}) {
  if (!dir || typeof dir !== 'string') return [];
  if (!pattern || typeof pattern !== 'string') return [];

  const { maxAge = null, recursive = false } = options;
  const results = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  const regex = new RegExp(`^${regexPattern}$`);

  function searchDir(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isFile() && regex.test(entry.name)) {
          let stats;
          try {
            stats = fs.statSync(fullPath);
          } catch {
            continue;
          }

          if (maxAge !== null) {
            const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
            if (ageInDays <= maxAge) {
              results.push({ path: fullPath, mtime: stats.mtimeMs });
            }
          } else {
            results.push({ path: fullPath, mtime: stats.mtimeMs });
          }
        } else if (entry.isDirectory() && recursive) {
          searchDir(fullPath);
        }
      }
    } catch {
      // 忽略权限错误
    }
  }

  searchDir(dir);
  results.sort((a, b) => b.mtime - a.mtime);

  return results;
}

/**
 * 从 stdin 读取 JSON（用于钩子输入）
 * @param {object} options - 选项
 * @param {number} options.timeoutMs - 超时毫秒数（默认 5000）
 * @returns {Promise<object>} 解析的 JSON 对象
 */
async function readStdinJson(options = {}) {
  const { timeoutMs = 5000, maxSize = 1024 * 1024 } = options;

  return new Promise((resolve) => {
    let data = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        process.stdin.removeAllListeners('data');
        process.stdin.removeAllListeners('end');
        process.stdin.removeAllListeners('error');
        if (process.stdin.unref) process.stdin.unref();
        try {
          resolve(data.trim() ? JSON.parse(data) : {});
        } catch {
          resolve({});
        }
      }
    }, timeoutMs);

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      if (data.length < maxSize) {
        data += chunk;
      }
    });

    process.stdin.on('end', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        resolve(data.trim() ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });

    process.stdin.on('error', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({});
    });
  });
}

/**
 * 输出到 stderr（在 Claude Code 中对用户可见）
 */
function log(message) {
  console.error(message);
}

/**
 * 输出到 stdout（返回给 Claude）
 */
function output(data) {
  if (typeof data === 'object') {
    console.log(JSON.stringify(data));
  } else {
    console.log(data);
  }
}

/**
 * 安全读取文本文件
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

/**
 * 写入文本文件
 */
function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * 追加到文本文件
 */
function appendFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, content, 'utf8');
}

/**
 * 检查命令是否存在于 PATH 中
 */
function commandExists(cmd) {
  if (!/^[a-zA-Z0-9_.-]+$/.test(cmd)) {
    return false;
  }

  try {
    if (isWindows) {
      const result = spawnSync('where', [cmd], { stdio: 'pipe' });
      return result.status === 0;
    } else {
      const result = spawnSync('which', [cmd], { stdio: 'pipe' });
      return result.status === 0;
    }
  } catch {
    return false;
  }
}

/**
 * 运行命令并返回输出
 * @param {string} cmd - 要执行的命令
 * @param {object} options - execSync 选项
 */
function runCommand(cmd, options = {}) {
  try {
    const result = execSync(cmd, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options
    });
    return { success: true, output: result.trim() };
  } catch (err) {
    return { success: false, output: err.stderr || err.message };
  }
}

/**
 * 检查当前目录是否是 git 仓库
 */
function isGitRepo() {
  return runCommand('git rev-parse --git-dir').success;
}

/**
 * 获取 git 修改的文件
 * @param {string[]} patterns - 用于过滤文件的正则模式数组
 * @returns {string[]} 修改的文件路径数组
 */
function getGitModifiedFiles(patterns = []) {
  if (!isGitRepo()) return [];

  const result = runCommand('git diff --name-only HEAD');
  if (!result.success) return [];

  let files = result.output.split('\n').filter(Boolean);

  if (patterns.length > 0) {
    const compiled = [];
    for (const pattern of patterns) {
      if (typeof pattern !== 'string' || pattern.length === 0) continue;
      try {
        compiled.push(new RegExp(pattern));
      } catch {
        // 跳过无效的正则模式
      }
    }
    if (compiled.length > 0) {
      files = files.filter(file => compiled.some(regex => regex.test(file)));
    }
  }

  return files;
}

/**
 * 替换文件中的文本（跨平台 sed 替代方案）
 * @param {string} filePath - 文件路径
 * @param {string|RegExp} search - 要搜索的模式
 * @param {string} replace - 替换字符串
 * @param {object} options - 选项 { all: 布尔值 }
 * @returns {boolean} 文件是否被写入
 */
function replaceInFile(filePath, search, replace, options = {}) {
  const content = readFile(filePath);
  if (content === null) return false;

  try {
    let newContent;
    if (options.all && typeof search === 'string') {
      newContent = content.replaceAll(search, replace);
    } else {
      newContent = content.replace(search, replace);
    }
    writeFile(filePath, newContent);
    return true;
  } catch (err) {
    log(`[Utils] replaceInFile 失败 ${filePath}: ${err.message}`);
    return false;
  }
}

/**
 * 统计文件中模式的出现次数
 */
function countInFile(filePath, pattern) {
  const content = readFile(filePath);
  if (content === null) return 0;

  let regex;
  try {
    if (pattern instanceof RegExp) {
      regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
    } else if (typeof pattern === 'string') {
      regex = new RegExp(pattern, 'g');
    } else {
      return 0;
    }
  } catch {
    return 0;
  }
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

/**
 * 在文件中搜索模式并返回匹配的行和行号
 */
function grepFile(filePath, pattern) {
  const content = readFile(filePath);
  if (content === null) return [];

  let regex;
  try {
    if (pattern instanceof RegExp) {
      const flags = pattern.flags.replace('g', '');
      regex = new RegExp(pattern.source, flags);
    } else {
      regex = new RegExp(pattern);
    }
  } catch {
    return [];
  }
  const lines = content.split('\n');
  const results = [];

  lines.forEach((line, index) => {
    if (regex.test(line)) {
      results.push({ lineNumber: index + 1, content: line });
    }
  });

  return results;
}

module.exports = {
  // 平台信息
  isWindows,
  isMacOS,
  isLinux,

  // 目录
  getHomeDir,
  getClaudeDir,
  getSessionsDir,
  getLearnedSkillsDir,
  getTempDir,
  ensureDir,

  // 日期/时间
  getDateString,
  getTimeString,
  getDateTimeString,

  // 会话/项目
  getSessionIdShort,
  getGitRepoName,
  getProjectName,

  // 文件操作
  findFiles,
  readFile,
  writeFile,
  appendFile,
  replaceInFile,
  countInFile,
  grepFile,

  // 钩子 I/O
  readStdinJson,
  log,
  output,

  // 系统
  commandExists,
  runCommand,
  isGitRepo,
  getGitModifiedFiles
};
