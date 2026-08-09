import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

type SliderProps = SliderPrimitive.Root.Props<number> & {
  /**
   * Returns the accessible label for the thumb's native range input.
   * Required when the slider has no associated visible label element.
   */
  getAriaLabel?: (index: number) => string
  /**
   * Returns an accessible value text (e.g. "720 RPM") for the range input.
   */
  getAriaValueText?:
    | ((formattedValue: string, value: number, index: number) => string)
    | null
}

/**
 * A technical single-value slider built on the Base UI slider.
 *
 * Wraps the Base UI slider so IoT components (e.g. SetpointSlider) don't
 * depend on the underlying control API. Controlled via `value` +
 * `onValueChange`; all keyboard and pointer behaviour comes from Base UI.
 */
function Slider({
  className,
  getAriaLabel,
  getAriaValueText,
  ...props
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1.5 w-full grow overflow-hidden bg-muted"
      >
        <SliderPrimitive.Indicator
          data-slot="slider-indicator"
          className="bg-primary"
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        getAriaLabel={getAriaLabel}
        getAriaValueText={getAriaValueText}
        className="block size-3.5 rounded-[2px] border border-primary bg-background outline-none has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  )
}

export { Slider }
