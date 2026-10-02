<script setup>
import { nextTick, ref } from 'vue'
import { Delete, EditPen, MagicStick, RefreshLeft } from '@element-plus/icons-vue'

const visible = defineModel({ type: Boolean, default: false })
const emit = defineEmits(['insert'])

const canvas = ref(null)
const canvasWrap = ref(null)
const color = ref('#263a34')
const lineWidth = ref(3)
const tool = ref('pen')
const drawing = ref(false)
const history = ref([])
let context
let logicalWidth = 0
let logicalHeight = 440
let previousPoint = null

function setupContext() {
  const dpr = window.devicePixelRatio || 1
  const element = canvas.value
  logicalWidth = Math.max(600, canvasWrap.value?.clientWidth || 760)
  element.width = Math.round(logicalWidth * dpr)
  element.height = Math.round(logicalHeight * dpr)
  element.style.width = `${logicalWidth}px`
  element.style.height = `${logicalHeight}px`
  context = element.getContext('2d')
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  clearCanvas(false)
}

async function initialize() {
  await nextTick()
  history.value = []
  setupContext()
}

function snapshot() {
  history.value.push(canvas.value.toDataURL('image/png'))
  if (history.value.length > 30) history.value.shift()
}

function pointFromEvent(event) {
  const rect = canvas.value.getBoundingClientRect()
  return { x: event.clientX - rect.left, y: event.clientY - rect.top, pressure: event.pressure || .5 }
}

function startStroke(event) {
  if (!context) return
  event.preventDefault()
  snapshot()
  drawing.value = true
  canvas.value.setPointerCapture?.(event.pointerId)
  previousPoint = pointFromEvent(event)
  context.beginPath()
  context.moveTo(previousPoint.x, previousPoint.y)
  context.strokeStyle = tool.value === 'eraser' ? '#ffffff' : color.value
  context.lineWidth = lineWidth.value * (event.pointerType === 'pen' ? .55 + previousPoint.pressure : 1)
  context.lineTo(previousPoint.x + .01, previousPoint.y + .01)
  context.stroke()
}

function drawStroke(event) {
  if (!drawing.value || !previousPoint) return
  event.preventDefault()
  const point = pointFromEvent(event)
  const middle = { x: (previousPoint.x + point.x) / 2, y: (previousPoint.y + point.y) / 2 }
  context.strokeStyle = tool.value === 'eraser' ? '#ffffff' : color.value
  context.lineWidth = (tool.value === 'eraser' ? lineWidth.value * 3 : lineWidth.value) * (event.pointerType === 'pen' ? .55 + point.pressure : 1)
  context.quadraticCurveTo(previousPoint.x, previousPoint.y, middle.x, middle.y)
  context.stroke()
  previousPoint = point
}

function endStroke(event) {
  if (!drawing.value) return
  drawing.value = false
  previousPoint = null
  context?.closePath()
  canvas.value.releasePointerCapture?.(event.pointerId)
}

function clearCanvas(record = true) {
  if (!context) return
  if (record) snapshot()
  context.save()
  context.setTransform(1, 0, 0, 1, 0, 0)
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.value.width, canvas.value.height)
  context.restore()
}

function restore(dataUrl) {
  const image = new Image()
  image.onload = () => {
    clearCanvas(false)
    context.drawImage(image, 0, 0, logicalWidth, logicalHeight)
  }
  image.src = dataUrl
}

function undo() {
  const previous = history.value.pop()
  if (previous) restore(previous)
}

function insertDrawing() {
  emit('insert', canvas.value.toDataURL('image/png'))
}
</script>

<template>
  <el-dialog v-model="visible" title="手写画板" width="900px" class="handwriting-dialog" append-to-body destroy-on-close
    @opened="initialize">
    <div class="handwriting-toolbar">
      <el-segmented v-model="tool"
        :options="[{ label: '画笔', value: 'pen', icon: EditPen }, { label: '橡皮', value: 'eraser', icon: MagicStick }]" />
      <div class="tool-divider"></div>
      <label>颜色 <el-color-picker v-model="color" :disabled="tool === 'eraser'" /></label>
      <label class="width-control">粗细 <el-slider v-model="lineWidth" :min="1" :max="18" :show-tooltip="false" /></label>
      <span class="width-preview"
        :style="{ width: `${lineWidth}px`, height: `${lineWidth}px`, background: tool === 'eraser' ? '#cfd6d1' : color }"></span>
      <div class="tool-spacer"></div>
      <el-tooltip content="撤销"><el-button :icon="RefreshLeft" :disabled="!history.length" @click="undo" /></el-tooltip>
      <el-popconfirm title="确定清空整个画板吗？" confirm-button-text="清空" cancel-button-text="取消" @confirm="clearCanvas()">
        <template #reference><el-button :icon="Delete">清空</el-button></template>
      </el-popconfirm>
    </div>
    <div ref="canvasWrap" class="canvas-wrap">
      <canvas ref="canvas" @pointerdown="startStroke" @pointermove="drawStroke" @pointerup="endStroke"
        @pointercancel="endStroke" @pointerleave="endStroke"></canvas>
    </div>
    <p class="handwriting-hint">支持鼠标、触屏和压感手写笔 · 手写内容会作为本地图片插入笔记</p>
    <template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary"
        @click="insertDrawing">插入笔记</el-button></template>
  </el-dialog>
</template>

<style scoped>
.handwriting-toolbar {
  display: flex;
  min-height: 46px;
  align-items: center;
  gap: 12px;
  padding: 0 2px 12px;
}

.handwriting-toolbar label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #707a75;
  font-size: 12px;
  white-space: nowrap;
}

.tool-divider {
  width: 1px;
  height: 24px;
  background: #e3e7e3;
}

.tool-spacer {
  flex: 1;
}

.width-control {
  width: 150px;
}

.width-control :deep(.el-slider) {
  width: 105px;
}

.width-preview {
  display: block;
  min-width: 2px;
  min-height: 2px;
  max-width: 18px;
  max-height: 18px;
  border-radius: 50%;
}

.canvas-wrap {
  width: 100%;
  overflow: auto;
  border: 1px solid #dfe4df;
  border-radius: 10px;
  background-color: #fff;
  background-image: linear-gradient(#eff2ef 1px, transparent 1px), linear-gradient(90deg, #eff2ef 1px, transparent 1px);
  background-size: 24px 24px;
  box-shadow: inset 0 1px 4px rgba(35, 55, 46, .04);
}

canvas {
  display: block;
  max-width: none;
  cursor: crosshair;
  touch-action: none;
}

.handwriting-hint {
  margin: 9px 3px 0;
  color: #9aa29e;
  font-size: 11px;
}
</style>
